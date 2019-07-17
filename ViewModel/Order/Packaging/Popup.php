<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\ViewModel\Order\Packaging;

use Dhl\ShippingCore\Model\Packaging\PackagingDataProvider;
use Dhl\ShippingCore\Model\ShippingDataHydrator;
use Magento\Backend\Model\UrlInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Registry;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Magento\Sales\Api\Data\ShipmentInterface;
use Magento\Sales\Model\Order\Shipment;
use Magento\Sales\Model\Order\Shipment\Item;

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
     * @return string[][]
     */
    public function getPackageOptions(): array
    {
        $data = $this->getProvidedData();

        return $data['package_options'] ?? [];
    }

    /**
     * @return string[][]
     */
    public function getItemOptions(): array
    {
        $data = $this->getProvidedData();

        return $data['item_options'] ?? [];
    }

    /**
     * @return string[][]
     */
    public function getServiceOptions(): array
    {
        $data = $this->getProvidedData();

        return $data['service_options'] ?? [];
    }

    /**
     * @return string[][]
     */
    public function getItemData(): array
    {
        $result = array_reduce(
            $this->getShipment()->getAllItems(),
            /**
             * @param Item $item
             * @param string[] $carry
             * @return array
             */
            static function ($carry, $item) {
                $carry[] = [
                    'id' => $item->getOrderItemId(),
                    'qty' => $item->getQty(),
                    'productName' => $item->getName(),
                    'weight' => $item->getWeight(),
                    'price' => $item->getPrice()
                ];

                return $carry;
            },
            []
        );

        return $result;
    }

    /**
     * Fetch data from PackagingDataProvider
     *
     * @return string[][]
     * @see \Dhl\ShippingCore\Model\Packaging\PackagingDataProvider
     */
    private function getProvidedData(): array
    {
        if (empty($this->data)) {
            try {
                $this->data = $this->hydrator->toArray($this->packageDataProvider->getData($this->getShipment()));
            } catch (LocalizedException $e) {
                $this->data = [];
            }
        }
        $orderCarrier = strtok((string) $this->getShipment()->getOrder()->getShippingMethod(), '_');

        $carrierData = array_filter(
            $this->data['carriers'] ?? [],
            static function ($carrierData) use ($orderCarrier) {
                return ($carrierData['code'] ?? '') === $orderCarrier;
            }
        );

        /** fall back to empty array, if no carrier data is provided */
        return array_pop($carrierData) ?? [];
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

    /**
     * Get image url from provided meta data
     *
     * @return string
     */
    public function getLogoImageUrl(): string
    {
        $data = $this->getProvidedData();

        return $data['metadata']['image_url'] ?? '';
    }
}
