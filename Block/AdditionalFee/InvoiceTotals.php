<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Block\AdditionalFee;

use Dhl\ShippingCore\Model\AdditionalFee\Total;
use Magento\Framework\View\Element\Template;
use Magento\Framework\View\Element\Template\Context;
use Magento\Sales\Block\Adminhtml\Order\Invoice\Totals;

/**
 * Invoice Totals
 *
 * @package  Dhl\Ui\Block
 * @author   Sebastian Ertner <sebastian.ertner@netresearch.de>
 * @link     https://www.netresearch.de/
 */
class InvoiceTotals extends Template
{
    /**
     * @var Total
     */
    private $total;

    /**
     * Totals constructor.
     *
     * @param Context $context
     * @param Total $total
     * @param array $data
     */
    public function __construct(
        Context $context,
        Total $total,
        array $data = []
    ) {
        parent::__construct($context, $data);

        $this->total = $total;
    }

    /**
     * Add service charge totals to invoice.
     *
     * @return $this
     */
    public function initTotals(): self
    {
        /** @var Totals $parentBlock */
        $parentBlock = $this->getParentBlock();
        $invoice = $parentBlock->getInvoice();

        if (!$invoice) {
            return $this;
        }

        $parentBlock->addTotalBefore(
            $this->total->createTotalDisplayObject($invoice),
            'grand_total'
        );

        return $this;
    }
}
