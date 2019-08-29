<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\ViewModel\Order\Info;

use Dhl\ShippingCore\Api\Data\ShippingOption\InputInterface;
use Dhl\ShippingCore\Api\Data\ShippingOption\OptionInterface;
use Dhl\ShippingCore\Api\Data\ShippingOption\Selection\AssignedSelectionInterface;
use Dhl\ShippingCore\Api\Data\ShippingOption\Selection\SelectionInterface;
use Dhl\ShippingCore\Model\Packaging\PackagingDataProvider;
use Dhl\ShippingCore\Model\ShippingOption\Selection\OrderSelectionRepository;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Registry;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Magento\Sales\Model\Order;
use Magento\Sales\Model\Order\ShipmentDocumentFactory;

/**
 * ShippingServices
 *
 * @package Dhl\Ui\ViewModel
 * @author  Sebastian Ertner <sebastian.ertner@netresearch.de>
 * @link    https://www.netresearch.de/
 */
class ShippingServices implements ArgumentInterface
{
    /**
     * @var Registry
     */
    private $registry;

    /**
     * @var PackagingDataProvider
     */
    private $packagingDataProvider;

    /**
     * @var ShipmentDocumentFactory
     */
    private $shipmentFactory;

    /**
     * @var SearchCriteriaBuilder
     */
    private $searchCriteriaBuilder;

    /**
     * @var OrderSelectionRepository
     */
    private $selectionRepository;

    /**
     * ShippingServices constructor.
     *
     * @param Registry $registry
     * @param PackagingDataProvider $packagingDataProvider
     * @param ShipmentDocumentFactory $shipmentFactory
     * @param SearchCriteriaBuilder $searchCriteriaBuilder
     * @param OrderSelectionRepository $selectionRepository
     */
    public function __construct(
        Registry $registry,
        PackagingDataProvider $packagingDataProvider,
        ShipmentDocumentFactory $shipmentFactory,
        SearchCriteriaBuilder $searchCriteriaBuilder,
        OrderSelectionRepository $selectionRepository
    ) {
        $this->registry = $registry;
        $this->packagingDataProvider = $packagingDataProvider;
        $this->shipmentFactory = $shipmentFactory;
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
        $this->selectionRepository = $selectionRepository;
    }

    /**
     * @return string[]
     */
    public function getSelectedServices(): array
    {
        /** @var Order $order */
        $order = $this->registry->registry('current_order');
        $shippingAddress = $order->getShippingAddress();
        if (!$shippingAddress) {
            return [];
        }
        if ($shippingAddress && !$shippingAddress->getId()) {
            return [];
        }
        $selections = $this->loadSelections($shippingAddress);

        if (empty($selections)) {
            // no selections present, either because there were none or the carrier is not compatible
            return [];
        }

        /** need to create a tmp shipment for packagingDataProvider */
        try {
            /** @var Order\Shipment $shipment */
            $shipment = $this->shipmentFactory->create($order);
            $packagingData = $this->packagingDataProvider->getData($shipment);
        } catch (LocalizedException $e) {
            return [];
        }

        $carrierCode = strtok((string) $order->getShippingMethod(), '_');
        $carrierData = $packagingData->getCarriers();

        // no carrier data for given carrier code - so we can exit here.
        if (!isset($carrierData[$carrierCode])) {
            return [];
        }

        $serviceOptions = $carrierData[$carrierCode]->getServiceOptions() ?? [];
        $result = [];
        foreach ($selections as $selection) {
            $shippingOptionCode = $selection->getShippingOptionCode();
            $inputCode = $selection->getInputCode();
            if (isset($serviceOptions[$shippingOptionCode])) {
                $serviceOption = $serviceOptions[$shippingOptionCode];
                $displayValue = $this->formatDisplayValue(
                    $serviceOption->getInputs()[$inputCode],
                    $result[$shippingOptionCode]['value'] ?? false
                );

                $result[$shippingOptionCode] = [
                    'label' => $serviceOption->getLabel(),
                    'value' => $displayValue,
                ];
            }
        }

        return $result;
    }

    /**
     * @param Order\Address $shippingAddress
     * @return SelectionInterface[]
     */
    private function loadSelections(Order\Address $shippingAddress): array
    {
        $searchCriteria = $this->searchCriteriaBuilder
            ->addFilter(
                AssignedSelectionInterface::PARENT_ID,
                $shippingAddress->getId()
            )->create();

        return $this->selectionRepository->getList($searchCriteria)->getItems();
    }

    /**
     * @param InputInterface $input
     * @param string|false $existingValue
     * @return \Magento\Framework\Phrase|string
     */
    private function formatDisplayValue(
        InputInterface $input,
        $existingValue
    ) {
        $displayValue = $input->getInputType() === 'radio' ? $this->getRadioOptionLabel(
            $input->getOptions()
        ) : $input->getDefaultValue();

        $displayValue = $displayValue === '1' ? __('Yes') : $displayValue;

        /**
         * If a previous selection already added a value here, append the new value.
         */
        if ($existingValue) {
            $displayValue = implode(', ', [$existingValue, $displayValue]);
        }

        return $displayValue;
    }

    /**
     * Gets the last option label from the available options
     *
     * @param OptionInterface[] $getOptions
     * @return string
     */
    private function getRadioOptionLabel(array $getOptions): string
    {
        /** @var string $label */
        $label = array_reduce(
            $getOptions,
            function (string $carry, OptionInterface $option) {
                return $option->getLabel();
            },
            ''
        );

        return $label;
    }
}
