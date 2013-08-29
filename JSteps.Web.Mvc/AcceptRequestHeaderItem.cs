using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace JSteps.Web.Mvc
{
    public class AcceptRequestHeaderItem
    {
        private const string _qualityParameterKey = "q";
        private static float _defaultQuality = 1;

        private bool _isAsterisk;

        private AcceptRequestHeaderItem()
        {
        }

        public AcceptRequestHeaderItem(string value, IDictionary<string, string> parameters)
        {
            Value = value;
            IsEmpty = string.IsNullOrWhiteSpace(value);
            _isAsterisk = value.Equals("*", StringComparison.OrdinalIgnoreCase);

            float quality;
            if (parameters.ContainsKey(_qualityParameterKey) && 
                float.TryParse(parameters[_qualityParameterKey], out quality))
            {
                Quality = quality;
            }
            else
            {
                Quality = _defaultQuality;
            }
            Accepted = Quality > 0;

            ExtensionParameters = parameters.Where(p => p.Key != _qualityParameterKey)
                .ToDictionary(k => k.Key, e => e.Value);
        }

        /// <summary>
        /// Whether or not the value is acceptable. Acceptable means Quality is non-zero an positive.
        /// </summary>
        public bool Accepted { get; private set; }

        /// <summary>
        /// Gets a collection of parameters that are not represented by an specific property.
        /// </summary>
        public IDictionary<string, string> ExtensionParameters { get; private set; }

        /// <summary>
        /// Whether or not the value is empty.
        /// </summary>
        public bool IsEmpty { get; private set; }

        /// <summary>
        /// Whether or not the value is a asterisk.
        /// </summary>
        public virtual bool IsAsterisk
        {
            get
            {
                return _isAsterisk;
            }
        }

        /// <summary>
        /// Gets the weighting (or qvalue, quality value) of the encoding
        /// </summary>
        public float Quality { get; private set; }

        /// <summary>
        /// Gets the value of one accept item (e.g. "gzip", "de-DE", "text/html").
        /// </summary>
        public string Value { get; private set; }
    }
}