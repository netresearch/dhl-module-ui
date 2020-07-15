# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

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
