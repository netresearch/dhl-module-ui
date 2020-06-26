<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\Model;

use Dhl\ShippingCore\Api\ConfigInterface;
use Magento\Checkout\Model\ConfigProviderInterface;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Store\Model\StoreManagerInterface;

class LocationFinderConfigProvider implements ConfigProviderInterface
{
    /**
     * @var ConfigInterface
     */
    private $coreConfig;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * LocationFinderConfigProvider constructor.
     *
     * @param ConfigInterface $coreConfig
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        ConfigInterface $coreConfig,
        StoreManagerInterface $storeManager
    ) {
        $this->coreConfig = $coreConfig;
        $this->storeManager = $storeManager;
    }

    /**
     * @return string[]
     */
    public function getConfig(): array
    {
        $storeId = $this->getStoreId();
        $token = $this->coreConfig->getLocationFinderApiToken($storeId);
        $url = $this->coreConfig->getLocationFinderMapTileUrl($storeId);

        return  [
            'locationFinder' => [
                'maptileApiToken' => $token,
                'maptileUrl' => str_replace('{api_token}', $token, $url),
                'mapAttribution' => $this->coreConfig->getLocationFinderMapAttribution($storeId)
            ]
        ];
    }

    /**
     * @return int|null
     */
    private function getStoreId()
    {
        try {
            $storeId = $this->storeManager->getStore()->getId();
        } catch (NoSuchEntityException $exception) {
            return null;
        }
        return $storeId;
    }
}
