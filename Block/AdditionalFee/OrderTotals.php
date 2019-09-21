<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Block\AdditionalFee;

use Dhl\ShippingCore\Model\AdditionalFee\Total;
use Magento\Directory\Model\Currency;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Sales\Block\Adminhtml\Order\Totals;

/**
 * Admin Sales Order Totals
 *
 * @package  Dhl\Ui\Block
 * @author   Sebastian Ertner <sebastian.ertner@netresearch.de>
 * @link     https://www.netresearch.de/
 */
class OrderTotals extends Template
{
    /**
     * @var Currency
     */
    private $currency;

    /**
     * @var Total
     */
    private $total;

    /**
     * Totals constructor.
     *
     * @param Context $context
     * @param Currency $currency
     * @param Total $total
     * @param array $data
     */
    public function __construct(
        Context $context,
        Currency $currency,
        Total $total,
        array $data = []
    ) {
        parent::__construct($context, $data);

        $this->currency = $currency;
        $this->total = $total;
    }

    /**
     * @return string
     */
    public function getCurrencySymbol(): string
    {
        return $this->currency->getCurrencySymbol();
    }

    public function initTotals()
    {
        /** @var Totals $parentBlock */
        $parentBlock = $this->getParentBlock();
        $order = $parentBlock->getOrder();

        $displayObject = $this->total->createTotalDisplayObject($order);
        if ($displayObject) {
            $parentBlock->addTotalBefore(
                $displayObject,
                'grand_total'
            );
        }


        return $this;
    }
}
