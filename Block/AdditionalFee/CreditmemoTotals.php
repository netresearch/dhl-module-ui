<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Block\AdditionalFee;

use Dhl\ShippingCore\Model\AdditionalFee\Total;
use Magento\Sales\Block\Adminhtml\Order\Creditmemo\Totals;
use Magento\Framework\View\Element\Template\Context;
use Magento\Framework\View\Element\Template;

/**
 * Creditmemo Totals
 *
 * @package  Dhl\Ui\Block
 * @author   Sebastian Ertner <sebastian.ertner@netresearch.de>
 * @link     https://www.netresearch.de/
 */
class CreditmemoTotals extends Template
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
     * Add service charge totals to creditmemo.
     *
     * @return $this
     */
    public function initTotals(): self
    {
        /** @var Totals $parentBlock */
        $parentBlock = $this->getParentBlock();
        $creditmemo = $parentBlock->getCreditmemo();

        $displayObject = $this->total->createTotalDisplayObject($creditmemo);
        if ($displayObject) {
            $parentBlock->addTotalBefore(
                $displayObject,
                'grand_total'
            );
        }
        return $this;
    }
}
