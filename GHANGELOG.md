# Changelog

## 0.9.8pre

- Nested tags which have the same node name as the body tag cause an exception. Closes issue [#4](https://github.com/rstaib/jquery-steps/issues/4)

## 0.9.7

- On finish failed the last step button does not become highlighted as error. Closes issue [#3](https://github.com/rstaib/jquery-steps/issues/3)
- Advanced accessibility support (WAI-ARIA)
- Replace Number() by parseInt() for parsing `string` to `int` values
- Add `"use strict";` and some other recommended things like the leading `;`
- Substitute `ol` by `ul` tag for step navigation
- Improve performance due to code refactoring

## 0.9.6

- Make css class for the outer component wrapper editable
- Add saveState option flag to enable/disable state persistence (saves last active step position)
- Add current class to step title and body for convinient css targeting [#2](https://github.com/rstaib/jquery-steps/issues/2)
- Add a bugfix related to the `startIndex` property
- Add a bugfix related to focusing after step changes
