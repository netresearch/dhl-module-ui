<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\ViewModel\Order\Info;

use Dhl\ShippingCore\Api\Data\RecipientStreetInterface;
use Magento\Framework\AuthorizationInterface;
use Magento\Framework\Escaper;
use Magento\Framework\UrlInterface;
use Magento\Framework\View\Element\Block\ArgumentInterface;

/**
 * RecipientStreet
 *
 * @author  Sebastian Ertner <sebastian.ertner@netresearch.de>
 * @link    https://www.netresearch.de/
 */
class RecipientStreet implements ArgumentInterface
{
    /**
     * @var UrlInterface
     */
    private $urlBuilder;

    /**
     * @var AuthorizationInterface
     */
    private $authorization;

    /**
     * @var Escaper
     */
    private $escaper;

    /**
     * RecipientStreetView constructor.
     * @param UrlInterface $urlBuilder
     * @param AuthorizationInterface $authorization
     * @param Escaper $escaper
     */
    public function __construct(
        UrlInterface $urlBuilder,
        AuthorizationInterface $authorization,
        Escaper $escaper
    ) {
        $this->urlBuilder = $urlBuilder;
        $this->authorization = $authorization;
        $this->escaper = $escaper;
    }

    /**
     * Get link to edit recipient street page.
     *
     * @param RecipientStreetInterface $recipientStreet
     * @param int $orderId
     * @return string
     */
    public function getRecipientStreetEditLink(RecipientStreetInterface $recipientStreet, int $orderId): string
    {
        if ($this->authorization->isAllowed('Magento_Sales::actions_edit')) {
            $label = __('Edit');
            $url = $this->urlBuilder->getUrl('dhl/recipient_street/edit', [
                'order_address_id' => $recipientStreet->getOrderAddressId(),
                'order_id' => $orderId
            ]);

            return '<a href="' . $this->escaper->escapeUrl($url) . '">' . $this->escaper->escapeHtml($label) . '</a>';
        }

        return '';
    }
}
