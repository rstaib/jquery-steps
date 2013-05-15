module("general");

test("contentMode", 5, function ()
{
    /*jshint -W024 */
    throws(function() { $("#contentModeWithEmptyStringArgument").steps(); }, /The enum key/, "Empty string argument");
    throws(function() { $("#contentModeWithWrongNumberArgument").steps(); }, /Invalid enum value/, "Invalid number argument");
    throws(function() { $("#contentModeWithWrongStringArgument").steps(); }, /The enum key/, "Invalid string argument");

    var contentModeWithNumberArgument = $("#contentModeWithNumberArgument").steps();
    equal(contentModeWithNumberArgument.steps("getCurrentStep").contentMode, 0, "Valid number argument");

    var contentModeWithStringArgument = $("#contentModeWithStringArgument").steps();
    equal(contentModeWithStringArgument.steps("getCurrentStep").contentMode, 0, "Valid string argument");
});