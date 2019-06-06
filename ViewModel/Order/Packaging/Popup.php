<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\ViewModel\Order\Packaging;

use Dhl\ShippingCore\Model\Config\CoreConfigInterface;
use Dhl\ShippingCore\Model\Packaging\PackagingDataProvider;
use Magento\Framework\Api\SimpleDataObjectConverter;
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
     * @var CoreConfigInterface
     */
    private $shippingCoreConfig;

    /**
     * @var PackagingDataProvider
     */
    private $packageDataProvider;

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
     * @param CoreConfigInterface $shippingCoreConfig
     */
    public function __construct(
        Registry $registry,
        CoreConfigInterface $shippingCoreConfig,
        PackagingDataProvider $dataProvider
    ) {
        $this->registry = $registry;
        $this->shippingCoreConfig = $shippingCoreConfig;
        $this->packageDataProvider = $dataProvider;
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

        return $this->normalizeKeys($data[PackagingDataProvider::GROUP_PACKAGE] ?? []);
    }

    /**
     * Normalize array keys to snake_case to have the same data structure as is used in checkout REST API
     *
     * @param string[] $dataArray
     * @return string[]
     */
    private function normalizeKeys($dataArray): array
    {
        $result = [];
        foreach ($dataArray as $key => $value) {
            if (is_array($value)) {
                $result[SimpleDataObjectConverter::camelCaseToSnakeCase($key)] = $this->normalizeKeys($value);
            } else {
                $result[SimpleDataObjectConverter::camelCaseToSnakeCase($key)] = $value;
            }
        }

        return $result;
    }

    /**
     * @return string[][]
     */
    public function getItemOptions(): array
    {
        $data = $this->getProvidedData();

        return $this->normalizeKeys($data[PackagingDataProvider::GROUP_ITEM] ?? []);
    }

    /**
     * @return string[][]
     */
    public function getServiceOptions(): array
    {
        $data = $this->getProvidedData();

        return $this->normalizeKeys($data[PackagingDataProvider::GROUP_SERVICE] ?? []);
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

        return $this->normalizeKeys($result);
    }

    /**
     * @return string[][]
     */
    private function getProvidedData(): array
    {
        if (!empty($this->data)) {
            $this->data = $this->packageDataProvider->getData($this->getShipment());
        }
        $orderCarrier = strtok((string) $this->getShipment()->getOrder()->getShippingMethod(), '_');

        return $this->data['carriers'][$orderCarrier] ?? [];
    }
}
