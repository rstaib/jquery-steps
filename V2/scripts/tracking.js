// Google Analytics
(function (i, s, o, g, r, a, m)
{
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function ()
    {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date(); a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-40997516-1', 'rafaelstaib.com');
ga('send', 'pageview');

// Anchor Event Tracking
$(function ()
{
    var filetypes = /\.(zip|exe|pdf|doc*|xls*|ppt*|mp3|js|md)$/i,
        baseHref = "";
    if ($("base").attr("href") != undefined)
    {
        baseHref = $("base").attr("href");
    }

    $("a").each(function ()
    {
        var href = $(this).attr("href");
        if (href && (href.match(/^https?\:/i)) && (!href.match(document.domain)))
        {
            $(this).click(function ()
            {
                ga("send", "event", "External", "Click", href.replace(/^https?\:\/\//i, ""));
                if ($(this).attr("target") != null && $(this).attr("target").toLowerCase() !== "_blank")
                {
                    setTimeout(function () { location.href = href; }, 200);
                    return false;
                }
            });
        }
        else if (href && href.match(/^mailto\:/i))
        {
            $(this).click(function ()
            {
                ga("send", "event", "Email", "Click", href.replace(/^mailto\:/i, ""));
            });
        }
        else if (href && href.match(filetypes))
        {
            $(this).click(function ()
            {
                ga("send", "event", "Download", "Click", href);
                if ($(this).attr("target") != null && $(this).attr("target").toLowerCase() !== "_blank")
                {
                    setTimeout(function () { location.href = baseHref + href; }, 200);
                    return false;
                }
            });
        }
    });
});