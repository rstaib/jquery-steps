using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace JSteps.Web.Mvc
{
    public class AcceptEncodingCollection
        : AcceptRequestHeaderCollectionBase<AcceptRequestHeaderItem>
    {
        public AcceptEncodingCollection(string header)
            : base(header)
        {
        }

        public override bool AcceptAsterisk
        {
            get { return true; }
        }

        public override bool AcceptEmptyHeader
        {
            get { return true; }
        }

        public override bool AcceptEmptyValue
        {
            get { return true; }
        }
    }
}