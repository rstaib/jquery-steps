using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.Optimization;

namespace JSteps
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            BundleTable.EnableOptimizations = true;

            bundles.Add(new ScriptBundle("~/Scripts/html5shiv")
                .Include("~/Scripts/html5shiv.js"));

            bundles.Add(GetBaseScripts("~/Scripts/Base")
                .AddFooterScripts());
            bundles.Add(GetBaseScripts("~/Scripts/Extended")
                .Include("~/Scripts/prettify.js")
                .AddFooterScripts());
            bundles.Add(GetBaseScripts("~/Scripts/Examples")
                .Include("~/Scripts/jquery.steps.js")
                .Include("~/Scripts/jquery.validate.js")
                .Include("~/Scripts/prettify.js")
                .AddFooterScripts());

            bundles.Add(GetBaseStyles("~/Content/Base"));
            bundles.Add(GetBaseStyles("~/Content/Extended")
                .Include("~/Content/prettify.css"));
            bundles.Add(GetBaseStyles("~/Content/Examples")
                .Include("~/Content/examples.css")
                .Include("~/Content/prettify.css"));
        }

        private static Bundle GetBaseScripts(string virtualPath)
        {
            return new ScriptBundle(virtualPath) { Orderer = new BundleOrderer() }
                .Include("~/Scripts/jquery-{version}.js")
                .Include("~/Scripts/bootstrap.js");
        }

        private static Bundle GetBaseStyles(string virtualPath)
        {
            return new StyleBundle(virtualPath) { Orderer = new BundleOrderer() }
                .Include("~/Content/bootstrap.css")
                .Include("~/Content/custom.css");
        }
    }

    public static class BundleExtensions
    {
        public static Bundle AddFooterScripts(this Bundle bundle)
        {
            return bundle.Include("~/Scripts/social.js")
                .Include("~/Scripts/tracking.js");
        }
    }

    public class BundleOrderer
        : IBundleOrderer
    {
        public IEnumerable<BundleFile> OrderFiles(BundleContext context, IEnumerable<BundleFile> files)
        {
            return files;
        }
    }
}