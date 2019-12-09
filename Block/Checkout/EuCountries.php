<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Block\Checkout;

use Dhl\ShippingCore\Api\ConfigInterface;
use Magento\Framework\View\Element\Template;

class EuCountries extends Template
{
    /**
     * @var ConfigInterface
     */
    private $coreConfig;

    protected $_template = "Dhl_Ui::checkout/eu-countries.phtml";

    /**
     * EuCountries constructor.
     * @param Template\Context $context
     * @param ConfigInterface $coreConfig
     * @param array $data
     */
    public function __construct(Template\Context $context, ConfigInterface $coreConfig, array $data = [])
    {
        $this->coreConfig = $coreConfig;

        parent::__construct($context, $data);
    }

    /**
     * @return string
     */
    public function getEuCountries(): string
    {
        return implode(',', $this->coreConfig->getEuCountries());
    }
}
