<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{config('app.name')}}@yield('title')</title>

        <!-- Latest compiled and minified CSS -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css">

        <!-- jQuery library -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

        <!-- Latest compiled JavaScript -->
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.2.1/js/bootstrap.min.js"></script>

        <script type="text/javascript">
            //used for confim any message
            function confirmation(msj){
                return confirm(msj);
            }
        </script>

        @yield('head')
    </head>
    <body>
        <div class="container">
            <hr>            
                <a href="{{ route('admin_index') }}">&lt;&lt; Back to admin panel</a>
                @yield('links')
            <hr>
        </div>
        @yield('content')
    </body>
</html>
