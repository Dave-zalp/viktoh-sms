<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
        }
        .button:hover {
            opacity: 0.9;
        }
        .info-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
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
            color: #667eea;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{ $appName }}!</h1>
        </div>

        <div class="content">
            <p>Hi <strong>{{ $username }}</strong>,</p>

            <p>Thank you for registering with {{ $appName }}! We're excited to have you on board.</p>

            <p>To complete your registration and start using all our features, please verify your email address by clicking the button below:</p>

            <div style="text-align: center;">
                <a href="{{ $verificationUrl }}" class="button">Verify Email Address</a>
            </div>

            <div class="info-box">
                <p style="margin: 0;"><strong>Important:</strong> This verification link will expire in 24 hours.</p>
            </div>

            <p>If you're having trouble clicking the button, copy and paste the following URL into your web browser:</p>
            <p style="word-break: break-all; color: #667eea;">{{ $verificationUrl }}</p>

            <p>If you did not create an account with {{ $appName }}, please ignore this email.</p>

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
