<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\DataProvider;

use Dhl\ShippingCore\Model\Config\CoreConfigInterface;
use Magento\Framework\Registry;
use Magento\Sales\Model\Order;
use Magento\Ui\DataProvider\AbstractDataProvider;

/**
 * Class PackagingPopup
 *
 * @package Dhl\Ui\DataProvider
 * @author Paul Siedler <paul.siedler@netresearch.de>
 * @copyright 2018 Netresearch GmbH & Co. KG
 * @link http://www.netresearch.de/
 */
class PackagingPopup extends AbstractDataProvider
{
    /**
     * @var Registry
     */
    private $registy;

    /**
     * @var CoreConfigInterface
     */
    private $shippingCoreConfig;

    /**
     * @var Order\Shipment\Item[]
     */
    private $items;

    /**
     * PackagingPopup constructor.
     *
     * @param string $name
     * @param string $primaryFieldName
     * @param string $requestFieldName
     * @param Registry $registry
     * @param CoreConfigInterface $shippingCoreConfig
     * @param array $meta
     * @param array $data
     */
    public function __construct(
        string $name,
        string $primaryFieldName,
        string $requestFieldName,
        Registry $registry,
        CoreConfigInterface $shippingCoreConfig,
        array $meta = [],
        array $data = []
    ) {
        $this->registy = $registry;
        $this->shippingCoreConfig = $shippingCoreConfig;

        parent::__construct($name, $primaryFieldName, $requestFieldName, $meta, $data);
    }

    /**
     * @return mixed[][]
     */
    public function getData(): array
    {
        $result = [
            'items' => array_merge_recursive(
                $this->getItemInputs(),
                $this->getNextButton('dhl_fieldset_item_properties')
            ),
            'item_properties' => array_merge_recursive(
                $this->getItemPropertyGroups(),
                $this->getItemPropertyGroupDataSources(),
                $this->getNextButton('dhl_fieldset_package')
            ),
            'package' => array_merge_recursive(
                $this->getPackageInputs(),
                $this->getNextButton('dhl_fieldset_package_customs')
            ),
            'customs' => array_merge_recursive(
                [],
                $this->getNextButton('dhl_fieldset_services')
            ),
            'service' => array_merge_recursive(
                $this->getServiceInputs(),
                $this->getNextButton('dhl_fieldset_summary')
            ),
            'summary' => array_merge_recursive(
                []
            ),
            'available_items' => array_map(
                function ($item) {
                    /** @var Order\Shipment\Item $item */
                    return $item->getOrderItemId();
                },
                $this->getItems()
            ),
            'selected_items' => array_map(
                function ($item) {
                    /** @var Order\Shipment\Item $item */
                    return $item->getOrderItemId();
                },
                $this->getItems()
            ),
            'active_fieldset' => 'dhl_fieldset_items',
            'item_names' => $this->getItemNames(),
        ];

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getServiceInputs(): array
    {
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'elementTmpl' => 'ui/form/element/switcher',
            'label' => __('Insurance'),
            'value' => true,
        ];
        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getPackageInputs(): array
    {
        $result = [];
        $totalWeight = array_reduce($this->getItems(), function (?float $carry, Order\Shipment\Item $item) {
            return $carry + $item->getWeight();
        });
        $weightUnit = $this->shippingCoreConfig->getWeightUnit($this->getItems()[0]->getShipment()->getStoreId());
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'name' => 'total_weight',
            'label' => __('Total Weight') . " ($weightUnit)",
            'notice' => __(
                'Note that this is an estimation only. If the weight of your physical package differs, different rates may apply.'
            ),
            'value' => $totalWeight,
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'elementTmpl' => 'ui/form/element/select',
            'label' => __('Type'),
            'options' => $this->getPackageTypes(),
            'tooltip' => [
                'description' => __('You can manage your package types in the shipping method configuration section.')],
            'caption' => __('Please select'),
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'label' => __('Width'),
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'label' => __('Height'),
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'label' => __('Depth'),
        ];
        $result['components'][] = [
            'component' => 'Magento_Ui/js/form/element/abstract',
            'template' => 'ui/form/field',
            'elementTmpl' => 'ui/form/element/select',
            'label' => __('Dimension Unit'),
            'options' => $this->getDimensionUnits(),
            'caption' => __('Please select'),
            'value' => $this->getDimensionUnits()[0]['value']
        ];

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getItemInputs(): array
    {
        $options = [];
        /** @var Order\Shipment\Item $item */
        foreach ($this->getItems() as $item) {
            $options[] = [
                'value' => $item->getOrderItemId(),
                'label' => $item->getName() . ' (' . __('Qty') . ': ' . $item->getQty() . ')',
            ];
        }
        $result['components'][] = [
            'nodeTemplate' => 'dhl_packaging_popup.dhl_packaging_popup.dhl_items_checkbox_set',
            'options' => $options,
            'notice' => __('Select which items to combine into one package. If you don\'t select all, you will have to configure another package next.'),
        ];

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getItemPropertyGroups(): array
    {
        $result = [];
        foreach ($this->getItems() as $item) {
            $result['components'][] = [
                'component' => 'Dhl_Ui/js/packaging/view/item-properties-fieldset',
                'label' => $item->getName(),
                'orderItemId' => $item->getOrderItemId(),
                'provider' => 'dhl_packaging_popup.dhl_packaging_popup_data_source',
                'dataScope' => 'item' . $item->getOrderItemId(),
                'dataScopeSelectedItems' => 'data.selected_items',
            ];
        }
        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getItemPropertyGroupDataSources(): array
    {
        $result = [];
        foreach ($this->getItems() as $item) {
            $result['item' . $item->getOrderItemId()]['components'] = $this->getItemPropertyInputs($item);
        }

        return $result;
    }

    /**
     * @param Order\Shipment\Item $item
     * @return mixed[]
     */
    private function getItemPropertyInputs(Order\Shipment\Item $item): array
    {
        $weightUnit = $this->shippingCoreConfig->getWeightUnit($item->getShipment()->getStoreId());
        $result = [];
        $result[] = [
            'nodeTemplate' => 'dhl_packaging_popup.dhl_packaging_popup.dhl_item_field',
            'name' => 'dhl_item_weight',
            'label' => __('Weight') . " ($weightUnit)",
            'value' => $item->getWeight() ?? 0.0,
            'disabled' => true,
        ];
        $result[] = [
            'nodeTemplate' => 'dhl_packaging_popup.dhl_packaging_popup.dhl_item_field',
            'name' => 'dhl_item_qty',
            'label' => __('Qty ordered'),
            'value' => $item->getQty(),
            'disabled' => true,
        ];
        $result[] = [
            'nodeTemplate' => 'dhl_packaging_popup.dhl_packaging_popup.dhl_item_field',
            'name' => 'dhl_item_description',
            'elementTmpl' => 'ui/form/element/textarea',
            'cols' => 5,
            'rows' => 60,
            'label' => __('Description'),
            'value' => $item->getDescription() ?: $item->getName(),
        ];

        return $result;
    }

    /**
     * @return mixed[]
     */
    private function getItemNames(): array
    {
        $items = [];
        foreach ($this->getItems() as $item) {
            $items[$item->getOrderItemId()] = $item->getName() . ' (' . __('Qty') . ': ' . $item->getQty() . ')';
        }

        return $items;
    }

    /**
     * @return Order\Shipment\Item[]
     */
    private function getItems(): array
    {
        if ($this->items === null) {
            $shipment = $this->registy->registry('current_shipment');
            $this->items = $shipment->getAllItems();
        }

        return $this->items;
    }

    /**
     * @return mixed[]
     */
    private function getPackageTypes(): array
    {
        return [
            [
                'label' => 'type 1',
                'value' => 'type 1',
            ],
            [
                'label' => 'type 2',
                'value' => 'type 2',
            ],
        ];
    }

    /**
     * @return string[][]
     */
    private function getDimensionUnits(): array
    {
        return [
            [
                'label' => 'cm',
                'value' => 'CENTIMETER',
            ],
            [
                'label' => 'in',
                'value' => 'INCH',
            ],
        ];
    }

    /**
     * @param string $nextFieldsetName
     * @return mixed[][]
     */
    private function getNextButton(string $nextFieldsetName): array
    {
        $result['components'][] = [
            'nodeTemplate' => 'dhl_packaging_popup.dhl_packaging_popup.dhl_button_next',
            'nextFieldsetName' => $nextFieldsetName,
        ];

        return $result;
    }
}
