<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\ViewModel\Order\Packaging;

use Dhl\ShippingCore\Model\Packaging\PackagingDataProvider;
use Dhl\ShippingCore\Model\ShippingDataHydrator;
use Magento\Backend\Model\UrlInterface;
use Magento\Framework\Registry;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Magento\Sales\Api\Data\ShipmentInterface;
use Magento\Sales\Model\Order\Shipment;

/**
 * Class Popup
 *
 * Viewmodel for the packaging popup. Draws its data from the Dhl\ShippingCore\Model\Packaging\PackagingDataProvider
 *
 * @author Paul Siedler <paul.siedler@netresearch.de>
 * @link https://www.netresearch.de/
 */
class Popup implements ArgumentInterface
{
    /**
     * @var Registry
     */
    private $registry;

    /**
     * @var PackagingDataProvider
     */
    private $packageDataProvider;

    /**
     * @var ShippingDataHydrator
     */
    private $hydrator;

    /**
     * @var UrlInterface
     */
    private $urlBuilder;

    /**
     * @var ShipmentInterface|Shipment
     */
    private $shipment;

    /**
     * @var string[][]
     */
    private $data = [];

    /**
     * Popup constructor.
     *
     * @param Registry $registry
     * @param PackagingDataProvider $packageDataProvider
     * @param ShippingDataHydrator $hydrator
     * @param UrlInterface $urlBuilder
     */
    public function __construct(
        Registry $registry,
        PackagingDataProvider $packageDataProvider,
        ShippingDataHydrator $hydrator,
        UrlInterface $urlBuilder
    ) {
        $this->registry = $registry;
        $this->packageDataProvider = $packageDataProvider;
        $this->hydrator = $hydrator;
        $this->urlBuilder = $urlBuilder;
    }

    /**
     * @return ShipmentInterface|Shipment
     */
    private function getShipment()
    {
        if ($this->shipment === null) {
            $this->shipment = $this->registry->registry('current_shipment');
        }

        return $this->shipment;
    }

    /**
     * Fetch data from PackagingDataProvider
     *
     * @return mixed[]
     * @throws \RuntimeException If something is wrong with the shipping options configuration
     * @see \Dhl\ShippingCore\Model\Packaging\PackagingDataProvider
     */
    public function getShippingSettings(): array
    {
        if (empty($this->data)) {
            $this->data = $this->hydrator->toArray($this->packageDataProvider->getData($this->getShipment()));
        }

        return $this->data;
    }

    /**
     * @return string
     */
    public function getSubmitUrl(): string
    {
        if ($this->getShipment()->getId() !== null) {
            $submitUrl = $this->urlBuilder->getUrl(
                'dhl/order_shipment/save/order_id/*/shipment_id/*/',
                [
                    'order_id' => $this->getShipment()->getOrderId(),
                    'shipment_id' => $this->getShipment()->getId(),
                ]
            );
        } else {
            $submitUrl = $this->urlBuilder->getUrl(
                'dhl/order_shipment/save/order_id/*/',
                [
                    'order_id' => $this->getShipment()->getOrderId(),
                ]
            );
        }

        return $submitUrl;
    }

    /**
     * Obtain the URL to redirect to after packaging popup submission.
     *
     * Redirects back to shipment page when label was requested for an existing
     * shipment. Redirects back to order page when shipment was created with label.
     *
     * @return string
     */
    public function getSuccessRedirectUrl(): string
    {
        if ($this->getShipment()->getId() !== null) {
            $successUrl = $this->urlBuilder->getUrl(
                'adminhtml/order_shipment/view',
                ['shipment_id' => $this->getShipment()->getId()]
            );
        } else {
            $successUrl = $this->urlBuilder->getUrl(
                'sales/order/view',
                ['order_id' => $this->getShipment()->getOrderId()]
            );
        }

        return $successUrl;
    }
}
