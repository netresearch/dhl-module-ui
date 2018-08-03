<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\DataProvider;

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
     * PackagingPopup constructor.
     *
     * @param string $name
     * @param string $primaryFieldName
     * @param string $requestFieldName
     * @param Registry $registry
     * @param array $meta
     * @param array $data
     */
    public function __construct(
        string $name,
        string $primaryFieldName,
        string $requestFieldName,
        Registry $registry,
        array $meta = [],
        array $data = []
    ) {
        $this->registy = $registry;

        parent::__construct($name, $primaryFieldName, $requestFieldName, $meta, $data);
    }

    public function getData(): array
    {
        return [
            'service' => $this->getServiceInputs(),
            'package' => array_merge($this->getPackageInputs(), $this->getExportPackageInputs()),
            'items' => array_merge($this->getItemInputs(), $this->getExportItemInputs()),
        ];
    }

    private function getServiceInputs(): array
    {
        /** @TODO: use provider classes for input retrieval */
        return [];
    }

    private function getPackageInputs(): array
    {
        /** @TODO provide default package inputs */
        return [
            [
                'component' => 'Magento_Ui/js/form/element/abstract',
                'template' => 'ui/form/field',
                'label' => 'myTest',
            ],
            [
                'component' => 'Magento_Ui/js/form/element/abstract',
                'template' => 'ui/form/field',
                'label' => 'my second test',
            ],
        ];
    }

    private function getExportPackageInputs(): array
    {
        /** @TODO: use provider classes for input retrieval */
        return [];
    }

    private function getItemInputs(): array
    {
        /** @var Order\Shipment $shipment */
        $shipment = $this->registy->registry('current_shipment');

        $options = [];
        $values = [];
        /** @var Order\Shipment\Item $item */
        foreach ($shipment->getAllItems() as $item) {
            $values[] = $item->getSku();
            $options[] = [
                'value' => $item->getSku(),
                'label' => $item->getName() . ' ' . $item->getSku(),
            ];

            $values[] = $item->getSku() . '2';
            $options[] = [
                'value' => $item->getSku() . '2',
                'label' => $item->getName() . ' ' . $item->getSku(),
            ];
        }
        $result = [
            [
                'component' => 'Magento_Ui/js/form/element/checkbox-set',
                'label' => 'Order Items',
                'provider' => 'dhl_packaging_popup.dhl_packaging_popup_data_source',
                'options' => $options,
                'default' => $values,
                'multiple' => true,
            ]
        ];

        return $result;
    }

    private function getExportItemInputs(): array
    {
        /** @TODO: use provider classes for input retrieval */
        return [];
    }
}
