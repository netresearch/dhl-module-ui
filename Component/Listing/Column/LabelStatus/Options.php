<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Component\Listing\Column\LabelStatus;

use Dhl\ShippingCore\Api\LabelStatus\LabelStatusManagementInterface;
use Magento\Framework\Data\OptionSourceInterface;

/**
 * Label Status Filter Options Source
 *
 * @package Dhl\Ui\Component
 * @author Sebastian Ertner <sebastian.ertner@netresearch.de>
 * @link https://www.netresearch.de/
 */
class Options implements OptionSourceInterface
{
    /**
     * Return array of options as value-label pairs
     *
     * @return array Format: array(array('value' => '<value>', 'label' => '<label>'), ...)
     */
    public function toOptionArray(): array
    {
        $options = [
            [
                'value' => LabelStatusManagementInterface::LABEL_STATUS_PENDING,
                'label' => __('Pending'),
            ],
            [
                'value' => LabelStatusManagementInterface::LABEL_STATUS_PARTIAL,
                'label' => __('Partial'),
            ],
            [
                'value' => LabelStatusManagementInterface::LABEL_STATUS_PROCESSED,
                'label' => __('Processed'),
            ],
            [
                'value' => LabelStatusManagementInterface::LABEL_STATUS_FAILED,
                'label' => __('Failed'),
            ]
        ];

        return $options;
    }
}
