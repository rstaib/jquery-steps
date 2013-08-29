using System.Web;
using System.Web.Mvc;
using JSteps.Web.Mvc;

namespace JSteps
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new CompressAttribute(), 100);
            filters.Add(new HandleErrorAttribute());
        }
    }
}