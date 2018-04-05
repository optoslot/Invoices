<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage" %>
<!DOCTYPE html>
<html>
	<head runat="server">
		<title></title>

		<script type="text/javascript" src="/Scripts/jquery-3.3.1.js"></script>

		<script type="text/javascript" src="/Scripts/angular.js"></script>
		<script type="text/javascript" src="/Scripts/angular-animate.js"></script>
		<script type="text/javascript" src="/Scripts/angular-aria.js"></script>
		<script type="text/javascript" src="/Scripts/angular-messages.js"></script>

		<link rel="stylesheet" href="/Content/angular-material.css">
		<script type="text/javascript" src="/Scripts/angular-material.js"></script>
	</head>
	<body>
		<h2>Welcome to ASP.NET MVC <%: ViewData["Version"] %> on <%: ViewData["Runtime"] %>!</h2>
	</body>
</html>