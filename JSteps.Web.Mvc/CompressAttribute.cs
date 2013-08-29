using System;
using System.Collections.Generic;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace JSteps.Web.Mvc
{
    public class CompressAttribute
        : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var request = filterContext.HttpContext.Request;
            var response = filterContext.HttpContext.Response;

            var acceptEncodingHeader = request.Headers["Accept-Encoding"];
            if (response.Filter != null && acceptEncodingHeader != null)
            {
                //NOTE: Values of supported have to be lowerd
                var supported = new string[] { "gzip", "deflate" };
                var items = new AcceptEncodingCollection(acceptEncodingHeader);
                var acceptedItem = items.FindAccepted(supported);

                switch (acceptedItem.Value)
                {
                    case "*":
                    case "gzip":
                        response.AppendHeader("Content-Encoding", "gzip");
                        response.Filter = new GZipStream(response.Filter, CompressionMode.Compress);
                        break;

                    case "deflate":
                        response.AppendHeader("Content-Encoding", "deflate");
                        response.Filter = new DeflateStream(response.Filter, CompressionMode.Compress);
                        break;

                    default:
                        break;
                }
            }

            base.OnActionExecuting(filterContext);
        }
    }
}