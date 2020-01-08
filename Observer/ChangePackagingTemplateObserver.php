<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Observer;

use Dhl\ShippingCore\Model\ShippingSettings\PackagingPopup;
use \Magento\Framework\Event\Observer;
use \Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Registry;
use Magento\Sales\Model\Order\Shipment;
use Magento\Shipping\Block\Adminhtml\Order\Packaging;

/**
 * Class ChangePackagingTemplateObserver
 *
 */
class ChangePackagingTemplateObserver implements ObserverInterface
{
    /**
     * @var Registry
     */
    private $coreRegistry;

    /**
     * @var PackagingPopup
     */
    private $packagingPopup;

    /**
     * ChangePackagingTemplateObserver constructor.
     *
     * @param Registry $coreRegistry
     * @param PackagingPopup $packagingPopup
     */
    public function __construct(Registry $coreRegistry, PackagingPopup $packagingPopup)
    {
        $this->coreRegistry = $coreRegistry;
        $this->packagingPopup = $packagingPopup;
    }

    /**
     * @param Observer $observer
     */
    public function execute(Observer $observer)
    {
        $block = $observer->getEvent()->getBlock();
        if ($block instanceof Packaging
            && $block->getNameInLayout() === 'shipment_packaging'
        ) {
            /** @var Shipment $currentShipment */
            $currentShipment = $this->coreRegistry->registry('current_shipment');
            /** @var string|null $shippingMethod */
            $shippingMethod = $currentShipment->getOrder()->getShippingMethod();
            $carrier = strtok($shippingMethod, '_');
            if ($carrier !== false && $this->packagingPopup->isSupported($carrier)) {
                $block->setTemplate('Dhl_Ui::order/packaging/popup.phtml');
            }
        }
    }
}
