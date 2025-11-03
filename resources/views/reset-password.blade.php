<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
        }
        .content p {
            margin: 0 0 15px;
            font-size: 16px;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            margin: 20px 0;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
        }
        .button:hover {
            opacity: 0.9;
        }
        .warning-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box {
            background: #f8f9fa;
            border-left: 4px solid #f5576c;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
        .footer a {
            color: #f5576c;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Your Password</h1>
        </div>

        <div class="content">
            <p>Hi <strong>{{ $username }}</strong>,</p>

            <p>We received a request to reset your password for your {{ $appName }} account.</p>

            <p>Click the button below to reset your password:</p>

            <div style="text-align: center;">
                <a href="{{ $resetUrl }}" class="button">Reset Password</a>
            </div>

            <div class="info-box">
                <p style="margin: 0;"><strong>Important:</strong> This password reset link will expire in 10 minutes for security reasons.</p>
            </div>

            <p>If you're having trouble clicking the button, copy and paste the following URL into your web browser:</p>
            <p style="word-break: break-all; color: #f5576c;">{{ $resetUrl }}</p>

            <div class="warning-box">
                <p style="margin: 0;"><strong>⚠️ Security Notice:</strong> If you did not request a password reset, please ignore this email or contact our support team if you have concerns about your account security.</p>
            </div>

            <p style="margin-top: 30px;">Best regards,<br>
            <strong>The {{ $appName }} Team</strong></p>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} {{ $appName }}. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>
