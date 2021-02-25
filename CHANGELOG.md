# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed

- Work around [Dotdigitalgroup_Sms issue #1](https://github.com/dotmailer/dotmailer-magento2-extension-sms/issues/1)
  by reading the input's error message instead of accessing the now unavailable validation result.
- Refresh service box in checkout when configuration changes. Available services are no longer kept in local storage for the lifetime of the quote.

### Fixed

- Show location finder in checkout when street or city are not yet entered
  (issues [#5](https://github.com/netresearch/dhl-module-ui/issues/5),
  [#6](https://github.com/netresearch/dhl-module-ui/issues/6)).
- Load shipping address mixin only in checkout (issue [#7](https://github.com/netresearch/dhl-module-ui/issues/7)).

## 1.2.2

### Fixed

- Show required field indicators only on input labels, not on unit symbols (e.g. "cm", "kg").

## 1.2.1

Bugfix release

### Fixed

- Require _jQuery Storage API_ to prevent uncaught type error, contributed by [@HenKun](https://github.com/HenKun) via [issue #4](https://github.com/netresearch/dhl-module-ui/issues/4)
- Persist service selection updates, especially removal of previously selected delivery location

## 1.2.0

Magento 2.4 compatibility release

### Added

- Support for Magento 2.4

### Removed

- Support for Magento 2.2

### Fixed

- IE 11 compatibility in checkout, contributed by [@sprankhub](https://github.com/sprankhub) via [PR #1](https://github.com/netresearch/dhl-module-ui/pull/1).
- Shipment confirmation email sending on _New Shipment_ page.

## 1.1.0

### Added

- Display the customer's service selection in customer account
- Provide layout handle to display the customer's service selection in sales emails

### Changed

- Migrate location finder to new mapbox tiles api
- Use grid layout in packaging popup

### Fixed

- Fix checkout with only virtual products in cart
- Fix initial calculation of package options in packaging popup for partial shipments
- Fix calculation of aggregate package options in packaging popup (e.g. total weight, package description)
- Fix HTTP request being sent twice when updating an order's recipient street

## 1.0.0

Initial release
