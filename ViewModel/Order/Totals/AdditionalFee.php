<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\ViewModel\Order\Totals;

use Dhl\ShippingCore\Api\TaxConfigInterface;
use Dhl\ShippingCore\Model\AdditionalFee\DisplayObject;
use Dhl\ShippingCore\Model\AdditionalFee\Total;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Magento\Sales\Model\Order;

/**
 * Class AdditionalFee
 *
 * Utility model class for displaying data for total rendering
 *
 * @author Paul Siedler <paul.siedler@netresearch.de>
 * @link https://www.netresearch.de/
 */
class AdditionalFee implements ArgumentInterface
{
    /**
     * @var TaxConfigInterface
     */
    private $taxConfig;

    /**
     * @var Total
     */
    private $total;

    /**
     * @var DisplayObject|null
     */
    private $displayObject;

    /**
     * AdditionalFee constructor.
     *
     * @param TaxConfigInterface $taxConfig
     * @param Total $total
     */
    public function __construct(TaxConfigInterface $taxConfig, Total $total)
    {
        $this->taxConfig = $taxConfig;
        $this->total = $total;
    }

    /**
     * @param Order|Order\Invoice|Order\Creditmemo $source
     * @return bool
     */
    public function displayBoth($source): bool
    {
        return $this->taxConfig->displaySalesBothPrices($source->getStoreId());
    }

    /**
     * @param Order|Order\Invoice|Order\Creditmemo $source
     * @return bool
     */
    public function displayIncludeTax($source): bool
    {
        return $this->taxConfig->displaySalesPriceIncludingTax($source->getStoreId());
    }

    /**
     * @param Order|Order\Invoice|Order\Creditmemo $source
     * @return DisplayObject
     */
    private function getDisplayObject($source): DisplayObject
    {
        if ($this->displayObject === null) {
            /** @var DisplayObject displayObject */
            $this->displayObject = $this->total->createTotalDisplayObject($source);
        }

        return $this->displayObject;
    }

    /**
     * @param Order|Order\Invoice|Order\Creditmemo $source
     * @param float $value
     * @return string
     */
    private function formatPrice($source, float $value): string
    {
        $order = $source;
        if ($source instanceof Order\Invoice || $source instanceof Order\Creditmemo) {
            $order = $source->getOrder();
        }

        return $order->formatPrice($value);
    }

    /**
     * @param Order|Order\Invoice|Order\Creditmemo $source
     * @return string
     */
    public function getPriceInclTax($source): string
    {
        return $this->formatPrice($source, $this->getDisplayObject($source)->getValueInclTax());
    }

    /**
     * @param Order|Order\Invoice|Order\Creditmemo $source
     * @return string
     */
    public function getPriceExclTax($source): string
    {
        return $this->formatPrice($source, $this->getDisplayObject($source)->getValueExclTax());
    }

    /**
     * @param Order|Order\Invoice|Order\Creditmemo $source
     * @return string
     */
    public function getLabel($source): string
    {
        return $this->getDisplayObject($source)->getLabel();
    }
}
