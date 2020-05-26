<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\ViewModel\Order\Info;

use Dhl\ShippingCore\Api\Data\ShippingSettings\ShippingOption\InputInterface;
use Dhl\ShippingCore\Api\Data\ShippingSettings\ShippingOption\OptionInterface;
use Dhl\ShippingCore\Api\Data\ShippingSettings\ShippingOption\Selection\AssignedSelectionInterface;
use Dhl\ShippingCore\Api\Data\ShippingSettings\ShippingOption\Selection\SelectionInterface;
use Dhl\ShippingCore\Api\Data\ShippingSettings\ShippingOptionInterface;
use Dhl\ShippingCore\Model\ShippingSettings\OrderDataProvider;
use Dhl\ShippingCore\Model\ShippingSettings\ShippingOption\Selection\OrderSelectionRepository;
use Magento\Framework\Api\SearchCriteriaBuilder;
use Magento\Framework\Registry;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Magento\Sales\Api\Data\OrderInterface;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Sales\Model\Order;

/**
 * ShippingServices
 *
 * @author  Sebastian Ertner <sebastian.ertner@netresearch.de>
 * @link    https://www.netresearch.de/
 */
class ShippingServices implements ArgumentInterface
{
    const SHOPFINDER_INPUT_TYPE = 'shopfinder';
    const SHOPFINDER_INPUT_COMPANY = 'company';
    const SHOPFINDER_INPUT_STREET = 'street';
    const SHOPFINDER_INPUT_POSTALCODE = 'postalCode';
    const SHOPFINDER_INPUT_CITY = 'city';
    const SHOPFINDER_INPUT_COUNTRYCODE = 'countryCode';

    /**
     * @var Registry
     */
    private $registry;

    /**
     * @var OrderDataProvider
     */
    private $orderDataProvider;

    /**
     * @var OrderRepositoryInterface
     */
    private $orderRepository;

    /**
     * @var SearchCriteriaBuilder
     */
    private $searchCriteriaBuilder;

    /**
     * @var OrderSelectionRepository
     */
    private $selectionRepository;

    /**
     * @var Order
     */
    private $order = null;

    /**
     * @var string[]
     */
    private $pickupLocationAddress = null;

    /**
     * ShippingServices constructor.
     *
     * @param Registry $registry
     * @param OrderDataProvider $orderDataProvider
     * @param SearchCriteriaBuilder $searchCriteriaBuilder
     * @param OrderRepositoryInterface $orderRepository
     * @param OrderSelectionRepository $selectionRepository
     */
    public function __construct(
        Registry $registry,
        OrderDataProvider $orderDataProvider,
        SearchCriteriaBuilder $searchCriteriaBuilder,
        OrderRepositoryInterface $orderRepository,
        OrderSelectionRepository $selectionRepository
    ) {
        $this->registry = $registry;
        $this->orderDataProvider = $orderDataProvider;
        $this->orderRepository = $orderRepository;
        $this->searchCriteriaBuilder = $searchCriteriaBuilder;
        $this->selectionRepository = $selectionRepository;
    }

    /**
     * @param int $orderId
     * @return string[]
     */
    public function getSelectedServicesByOrderId(int $orderId): array
    {
        $order = $this->orderRepository->get($orderId);
        return $this->getSelectedServices($order);
    }

    /**
     * @return string[]
     */
    public function getSelectedServices(OrderInterface $order = null): array
    {
        if (!$order) {
            $order = $this->getOrder();
        }
        $this->order = $order;
        $shippingAddress = $order->getShippingAddress();

        if (!$shippingAddress || !$shippingAddress->getId()) {
            return [];
        }
        $selections = $this->loadSelections($shippingAddress);
        $serviceOptions = $this->getServiceOptions();
        $result = [];
        foreach ($selections as $selection) {
            $shippingOptionCode = $selection->getShippingOptionCode();
            $inputCode = $selection->getInputCode();
            if (isset($serviceOptions[$shippingOptionCode])) {
                $serviceOption = $serviceOptions[$shippingOptionCode];
                $inputs = $serviceOption->getInputs();
                if (!isset($inputs[$inputCode]) || $inputs[$inputCode]->getInputType() === 'hidden') {
                    continue;
                }
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
     * @return string[]
     */
    public function getPickupLocationAddress(): array
    {
        if ($this->pickupLocationAddress !== null) {
            return $this->pickupLocationAddress;
        }

        $this->pickupLocationAddress = [];

        $shippingAddress = $this->getOrder()->getShippingAddress();
        if (!$shippingAddress || !$shippingAddress->getId()) {
            return $this->pickupLocationAddress;
        }
        $serviceOptions = $this->getServiceOptions();
        $selections = $this->loadSelections($shippingAddress);

        $dropoffInputs = false;
        foreach ($selections as $selection) {
            $serviceOption = $serviceOptions[$selection->getShippingOptionCode()];
            if ($serviceOption) {
                foreach ($serviceOption->getInputs() as $input) {
                    if ($input->getInputType() === self::SHOPFINDER_INPUT_TYPE) {
                        $dropoffInputs = $serviceOption->getInputs();
                        break 2;
                    }
                }
            }
        }

        if (!$dropoffInputs) {
            return $this->pickupLocationAddress;
        }

        if (isset($dropoffInputs[self::SHOPFINDER_INPUT_COMPANY])) {
            $this->pickupLocationAddress[] = $dropoffInputs[self::SHOPFINDER_INPUT_COMPANY]->getDefaultValue();
        }
        if (isset($dropoffInputs[self::SHOPFINDER_INPUT_STREET])) {
            $this->pickupLocationAddress[] = $dropoffInputs[self::SHOPFINDER_INPUT_STREET]->getDefaultValue();
        }
        if (isset($dropoffInputs[self::SHOPFINDER_INPUT_POSTALCODE], $dropoffInputs[self::SHOPFINDER_INPUT_CITY])) {
            $this->pickupLocationAddress[] = implode(' ', [
                $dropoffInputs[self::SHOPFINDER_INPUT_POSTALCODE]->getDefaultValue(),
                $dropoffInputs[self::SHOPFINDER_INPUT_CITY]->getDefaultValue()
            ]);
        }
        if (isset($dropoffInputs[self::SHOPFINDER_INPUT_COUNTRYCODE])) {
            $this->pickupLocationAddress[] = $dropoffInputs[self::SHOPFINDER_INPUT_COUNTRYCODE]->getDefaultValue();
        }

        return $this->getPickupLocationAddress();
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
     * @return string
     */
    private function formatDisplayValue(
        InputInterface $input,
        $existingValue
    ): string {
        $displayValue = $input->getInputType() === 'radio' ? $this->getRadioOptionLabel(
            $input->getOptions()
        ) : $input->getDefaultValue();

        $displayValue = $displayValue === '1' ? __('Yes')->render() : $displayValue;

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

    /**
     * @return ShippingOptionInterface[]
     */
    private function getServiceOptions(): array
    {
        $shippingAddress = $this->getOrder()->getShippingAddress();
        if (!$shippingAddress || !$shippingAddress->getId()) {
            return [];
        }
        /** need to create a tmp shipment for packagingDataProvider */
        $carrierData = $this->orderDataProvider->getShippingOptions($this->getOrder());
        if ($carrierData === null) {
            return [];
        }

        return $carrierData->getServiceOptions() ?? [];
    }

    /**
     * @return Order
     */
    private function getOrder(): Order
    {
        if (!$this->order) {
            $this->order = $this->registry->registry('current_order');
        }
        return $this->order;
    }
}
