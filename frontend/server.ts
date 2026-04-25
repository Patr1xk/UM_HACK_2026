import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import http from "http";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log all incoming requests
  app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.path}`);
    next();
  });

  // Initialize Resend
  // It relies on RESEND_API_KEY from environment variables.
  const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // IMPORTANT: This explicit route handler could be matching before proxy!
  // Let's add logging here
  app.post("/api/send-reminder", async (req, res) => {
    console.log("[send-reminder] Request received");
    const { targetEmail, targetName, taskTitle, dueDate, isInternal, employeeName } = req.body;
    
    if (!targetEmail || !taskTitle) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      if (!process.env.RESEND_API_KEY) {
        // Mock sending if no API key is provided
        console.log(`[Email Mock] Sending reminder to ${targetEmail} for task: ${taskTitle}`);
        return res.json({ success: true, mocked: true });
      }

      const htmlContent = isInternal ? `
          <div style="font-family: sans-serif; color: #333;">
            <h2>Action Required: Pending HR/IT Task for ${employeeName}</h2>
            <p>Hi ${targetName},</p>
            <p>We noticed an outstanding internal task required for onboarding ${employeeName} that is approaching its deadline.</p>
            <div style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 16px 0;">
              <strong>Task:</strong> ${taskTitle}<br/>
              <strong>Due Date:</strong> ${dueDate}
            </div>
            <p>Please complete this task to avoid any delays in the onboarding process.</p>
            <p>Thank you,<br/>Onboarding System</p>
          </div>
        ` : `
          <div style="font-family: sans-serif; color: #333;">
            <h2>Action Required: Outstanding Onboarding Task</h2>
            <p>Hi ${targetName},</p>
            <p>We noticed that you have an outstanding onboarding task that needs to be completed.</p>
            <div style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 16px 0;">
              <strong>Task:</strong> ${taskTitle}<br/>
              <strong>Due Date:</strong> ${dueDate}
            </div>
            <p>Please log in to the employee portal to submit this document as soon as possible.</p>
            <p>Thank you,<br/>HR Team</p>
          </div>
        `;

      const data = await resend.emails.send({
        from: 'Onboarding Team <onboarding@resend.dev>', // resend.dev allows sending to verified emails or if premium
        to: [targetEmail],
        subject: isInternal ? `ACTION REQUIRED: Pending Task for ${employeeName} - ${taskTitle}` : `ACTION REQUIRED: Missing Onboarding Document - ${taskTitle}`,
        html: htmlContent,
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email reminder", details: String(error) });
    }
  });

  // Manual proxy to backend (http-proxy-middleware was incompatible)
  app.use("/api", (req, res) => {
    const options = {
      hostname: "localhost",
      port: 8000,
      path: req.path,
      method: req.method,
      headers: {
        ...req.headers,
        host: "localhost:8000", // Override host header
      },
      timeout: 45000, // 45 second timeout
    };

    console.log(`[Proxy] Forwarding ${req.method} ${req.path} to http://localhost:8000${req.path}`);
    console.log(`[Proxy] Headers:`, JSON.stringify(options.headers, null, 2));
    console.log(`[Proxy] Content-Type:`, options.headers["content-type"]);

    const proxyReq = http.request(options, (proxyRes) => {
      console.log(`[Proxy] Got response: ${proxyRes.statusCode}`);
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("[Proxy Error]", err.message);
      res.status(502).json({
        error: "Bad Gateway",
        message: err.message,
      });
    });

    proxyReq.on("timeout", () => {
      console.error("[Proxy Timeout]");
      proxyReq.destroy();
      res.status(504).json({
        error: "Gateway Timeout",
        message: "Backend did not respond within 45 seconds",
      });
    });

    // Forward request body
    if (req.method !== "GET" && req.method !== "HEAD") {
      // Check if body is JSON (parsed by express.json())
      const isJson = req.get("content-type")?.includes("application/json");

      if (isJson && req.body && typeof req.body === "object") {
        // Body was parsed by express.json() - write it as JSON
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        console.log(`[Proxy] Forwarding parsed JSON body: ${bodyData.substring(0, 100)}...`);
        proxyReq.write(bodyData);
        proxyReq.end();
      } else {
        // Body is raw stream (e.g., FormData, multipart) - pipe it
        console.log(`[Proxy] Forwarding raw body stream (FormData)`);
        console.log(`[Proxy] req.body exists:`, !!req.body);
        req.pipe(proxyReq);
      }
    } else {
      proxyReq.end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
