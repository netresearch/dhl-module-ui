<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Block\Adminhtml\RecipientStreet\Edit\Buttons;

use Magento\Framework\View\Element\UiComponent\Control\ButtonProviderInterface;

/**
 * BackButton
 *
 * @package Dhl\Ui\Block\Adminhtml
 * @author  Sebastian Ertner <sebastian.ertner@netresearch.de>
 * @link https://www.netresearch.de/
 */
class BackButton extends Generic implements ButtonProviderInterface
{
    /**
     * Get Ui Component Back Button Data.
     *
     * @return string[]
     */
    public function getButtonData(): array
    {
        return [
            'label' => __('Back'),
            'on_click' => sprintf("location.href = '%s';", $this->getBackUrl()),
            'class' => 'back',
            'sort_order' => 10
        ];
    }

    /**
     * Get URL for back (reset) button
     *
     * @return string
     */
    public function getBackUrl(): string
    {
        $orderId = $this->context->getRequest()->getParam('order_id');
        return $this->getUrl('sales/order/view', ['order_id' => $orderId]);
    }
}
