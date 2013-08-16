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

            return Json(new { title = "Async", content = "Async Result " + DateTime.UtcNow.ToString() });
        }

        public ActionResult EmbeddedContent()
        {
            return View();
        }
    }
}