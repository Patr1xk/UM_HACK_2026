import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Resend
  // It relies on RESEND_API_KEY from environment variables.
  const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/send-reminder", async (req, res) => {
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
