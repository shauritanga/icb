<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Admin | DIT ICB</title>
    <link rel="shortcut icon" type="image/ico" href="/favicon.ico">
    @vite(['resources/js/admin.tsx', 'resources/css/app.css'])
</head>
<body>
    <div id="admin-root"></div>
</body>
</html>
