using System.Web;
using System.Web.Optimization;

namespace JSteps
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/Scripts/html5shiv")
                .Include("~/Scripts/html5shiv.js"));

            bundles.Add(GetBaseScripts("~/Scripts/Base"));
            bundles.Add(GetBaseScripts("~/Scripts/Extended")
                .Include("~/Scripts/prettify.js"));

            bundles.Add(GetBaseStyles("~/Content/Base"));
            bundles.Add(GetBaseStyles("~/Content/Extended")
                .Include("~/Content/prettify.css"));
        }

        private static Bundle GetBaseScripts(string virtualPath)
        {
            return new ScriptBundle(virtualPath)
                .Include("~/Scripts/jquery-{version}.js")
                .Include("~/Scripts/bootstrap.js")
                .Include("~/Scripts/viewport-fix-mobile-ie10.js")
                .Include("~/Scripts/social.js")
                .Include("~/Scripts/tracking.js");
        }

        private static Bundle GetBaseStyles(string virtualPath)
        {
            return new StyleBundle(virtualPath)
                .Include("~/Content/bootstrap.css")
                .Include("~/Content/viewport-fix-mobile-ie10.css")
                .Include("~/Content/custom.css");
        }
    }
}