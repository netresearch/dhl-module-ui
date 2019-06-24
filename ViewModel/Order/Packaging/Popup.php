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
    private $urlModel;

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
     * @param Registry $registry
     * @param PackagingDataProvider $packageDataProvider
     * @param ShippingDataHydrator $hydrator
     * @param UrlInterface $urlModel
     */
    public function __construct(
        Registry $registry,
        PackagingDataProvider $packageDataProvider,
        ShippingDataHydrator $hydrator,
        UrlInterface $urlModel
    ) {
        $this->registry = $registry;
        $this->packageDataProvider = $packageDataProvider;
        $this->hydrator = $hydrator;
        $this->urlModel = $urlModel;
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
                $carry[] = ['id' => $item->getOrderItemId(), 'qty' => $item->getQty()];

                return $carry;
            },
            []
        );

        return $result;
    }

    /**
     * @return string[][]
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

        return array_filter(
            $this->data['carriers'] ?? [],
            static function ($carrierData) use ($orderCarrier) {
                return ($carrierData['code'] ?? '') === $orderCarrier;
            }
        )[0];
    }

    /**
     * @return string
     */
    public function getSubmitUrl(): string
    {
        return $this->urlModel->getUrl('dhl/order_shipment/save/order_id/*/', [
            'order_id' => $this->getShipment()->getOrderId()
        ]);
    }
}
