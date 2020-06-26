<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Model\Sales\Pdf;

use Dhl\ShippingCore\Api\AdditionalFee\TaxConfigInterface;
use Dhl\ShippingCore\Model\AdditionalFee\Total;
use Magento\Sales\Model\Order\Pdf\Total\DefaultTotal;
use Magento\Tax\Helper\Data;
use Magento\Tax\Model\Calculation;
use Magento\Tax\Model\ResourceModel\Sales\Order\Tax\CollectionFactory;

/**
 * Handles totals display for PDF prints of invoices/creditmemos.
 */
class AdditionalFee extends DefaultTotal
{
    /**
     * @var \Dhl\Ui\ViewModel\Order\Totals\AdditionalFee
     */
    private $viewModel;

    /** @var Total */
    private $total;

    /**
     * AdditionalFee constructor.
     *
     * @param Data $taxHelper
     * @param Calculation $taxCalculation
     * @param CollectionFactory $ordersFactory
     * @param TaxConfigInterface $taxConfig
     * @param Total $total
     * @param mixed[] $data
     */
    public function __construct(
        Data $taxHelper,
        Calculation $taxCalculation,
        CollectionFactory $ordersFactory,
        TaxConfigInterface $taxConfig,
        Total $total,
        array $data = []
    ) {
        $this->total = $total;
        $this->viewModel = $taxConfig;
        parent::__construct($taxHelper, $taxCalculation, $ordersFactory, $data);
    }

    /**
     * Get array of arrays with totals information for display in PDF
     * array(
     *  $index => array(
     *      'amount'   => $amount,
     *      'label'    => $label,
     *      'font_size'=> $font_size
     *  )
     * )
     *
     * @return string[][]
     */
    public function getTotalsForDisplay(): array
    {
        $storeId = $this->getOrder()->getStoreId();
        $displayObject = $this->total->createTotalDisplayObject($this->getSource());
        $fontSize = $this->getFontSize() ?: 7;
        if ($displayObject === null) {
            return [];
        }
        $baseConfig = [
            'title' => $displayObject->getLabel(),
            'font_size' => $fontSize,
        ];

        $valueExclTax = $this->getOrder()->formatPriceTxt($displayObject->getValueExclTax());
        $valueInclTax = $this->getOrder()->formatPriceTxt($displayObject->getValueInclTax());
        if ($this->viewModel->displaySalesBothPrices($storeId)) {
            $totals = [
                array_merge(
                    $baseConfig,
                    [
                        'amount' => $valueExclTax,
                        'label' => $displayObject->getLabel() . ' ' . __('(Excl. Tax)') . ':',

                    ]
                ),
                array_merge(
                    $baseConfig,
                    [
                        'amount' => $valueInclTax,
                        'label' => $displayObject->getLabel() . ' ' . __('(Incl. Tax)') . ':',
                    ]
                ),
            ];
        } elseif ($this->viewModel->displaySalesPriceIncludingTax($storeId)) {
            $totals = [
                array_merge(
                    $baseConfig,
                    [
                        'amount' => $valueInclTax,
                        'label' => $displayObject->getLabel() . ':',
                    ]
                ),
            ];
        } else {
            $totals = [
                array_merge(
                    $baseConfig,
                    [
                        'amount' => $valueExclTax,
                        'label' => $displayObject->getLabel() . ':',
                    ]
                ),
            ];
        }

        return $totals;
    }
}
