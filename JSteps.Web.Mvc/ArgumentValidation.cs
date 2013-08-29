using System;

namespace JSteps.Web.Mvc
{
    public static class ArgumentValidation
    {
        public static void ValidateArgument(string argumentName, object argumentValue)
        {
            if (argumentValue == null)
            {
                throw new ArgumentNullException(argumentName, "The value cannot be null.");
            }
        }

        public static void ValidateStringArgument(string argumentName, string argumentValue)
        {
            if (string.IsNullOrEmpty(argumentValue))
            {
                throw new ArgumentException("The value cannot be null or empty.", argumentName);
            }
        }
    }
}