using System.Web;
using System.Web.Optimization;

namespace JSteps
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/Scripts/Base")
                .Include("~/Scripts/jquery-{version}.js")
                .Include("~/Scripts/bootstrap.js")
                .Include("~/Scripts/viewport-fix-mobile-ie10.js")
                .Include("~/Scripts/social.js")
                .Include("~/Scripts/tracking.js")
                .Include("~/Scripts/prettify.js"));

            bundles.Add(new ScriptBundle("~/Scripts/html5shiv")
                .Include("~/Scripts/html5shiv.js"));

            bundles.Add(new StyleBundle("~/Content/Base")
                .Include("~/Content/bootstrap.css")
                .Include("~/Content/viewport-fix-mobile-ie10.css")
                .Include("~/Content/custom.css")
                .Include("~/Content/prettify.css"));
        }
    }
}