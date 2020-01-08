<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Observer;

use Dhl\ShippingCore\Api\SplitAddress\RecipientStreetRepositoryInterface;
use Magento\Framework\App\Request\Http;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Sales\Api\Data\OrderInterface;

/**
 * AddRecipientStreetInfoBlock Observer
 *
 * @author  Sebastian Ertner <sebastian.ertner@netresearch.de>
 * @link https://www.netresearch.de/
 */
class AddRecipientStreetInfoBlock implements ObserverInterface
{
    /**
     * @var RecipientStreetRepositoryInterface
     */
    private $recipientStreetRepository;

    /**
     * @var RequestInterface|Http
     */
    private $request;

    /**
     * AddRecipientStreetInfoBlock constructor.
     * @param RecipientStreetRepositoryInterface $recipientStreetRepository
     * @param RequestInterface $request
     */
    public function __construct(
        RecipientStreetRepositoryInterface $recipientStreetRepository,
        RequestInterface $request
    ) {
        $this->recipientStreetRepository = $recipientStreetRepository;
        $this->request = $request;
    }

    /**
     * @param Observer $observer
     * @throws LocalizedException
     */
    public function execute(Observer $observer)
    {
        $applicableActions = [
            'sales_order_view',
            'adminhtml_order_shipment_new',
            'adminhtml_order_shipment_view'
        ];

        $action = $this->request->getFullActionName();
        if (!in_array($action, $applicableActions, true)) {
            // not the order details page
            return;
        }

        $block = $observer->getData('block');
        if (!$block instanceof \Magento\Sales\Block\Adminhtml\Order\View\Info) {
            return;
        }

        $order = $block->getOrder();
        $shippingAddress = $order->getShippingAddress();
        if (!$order instanceof OrderInterface || !$shippingAddress) {
            // wrong type, virtual or corrupt order
            return;
        }

        try {
            $recipientStreet = $this->recipientStreetRepository->get((int) $shippingAddress->getId());
        } catch (NoSuchEntityException $e) {
            // no recipient street for this order
            return;
        }

        $recipientAddressBlock = $block->getChildBlock('dhl_recipient_street');
        $recipientAddressBlock->setData('recipient_street', $recipientStreet);
        $recipientAddressBlock->setData('order_id', (int) $order->getId());

        $transport = $observer->getData('transport');
        $html = $transport->getData('html');
        $html.= $recipientAddressBlock->toHtml();
        $transport->setData('html', $html);
    }
}
