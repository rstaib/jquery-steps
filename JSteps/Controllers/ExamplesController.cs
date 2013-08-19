using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace JSteps.Controllers
{
    public class ExamplesController
        : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public async Task<ActionResult> AsyncContent()
        {
            await Task.Delay(2000);

            return Content("<p>To test async loading again press \"Next\" and then go back to the first step.</p><p>I deactivated content cache for this demo so that you can try it again and again.</p>");
        }

        public ActionResult EmbeddedContent()
        {
            return View();
        }
    }
}