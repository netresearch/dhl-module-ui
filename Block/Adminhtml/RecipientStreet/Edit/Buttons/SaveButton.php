<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Block\Adminhtml\RecipientStreet\Edit\Buttons;

use Magento\Framework\View\Element\UiComponent\Control\ButtonProviderInterface;

/**
 * SaveButton
 *
 * @author  Sebastian Ertner <sebastian.ertner@netresearch.de>
 * @link https://www.netresearch.de/
 */
class SaveButton extends Generic implements ButtonProviderInterface
{
    /**
     * Get UI Component Save Button Data.
     *
     * @return string[]
     */
    public function getButtonData(): array
    {
        return [
            'label' => __('Save'),
            'class' => 'save primary',
            'data_attribute' => [
                'mage-init' => [
                    'buttonAdapter' => [
                        'actions' => [
                            [
                                'targetName' => 'recipient_street_form.recipient_street_form',
                                'actionName' => 'save',
                                'params' => [
                                    true,
                                    [
                                        'back' => 'edit',
                                        'order_id' => $this->context->getRequest()->getParam('order_id')
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            'sort_order' => 90
        ];
    }
}
