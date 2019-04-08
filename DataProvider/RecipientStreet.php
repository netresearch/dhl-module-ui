<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\DataProvider;

use Dhl\ShippingCore\Model\ResourceModel\RecipientStreet\CollectionFactory;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection;
use Magento\Ui\DataProvider\AbstractDataProvider;

/**
 * Class RecipientStreet
 *
 * @package Dhl\Ui\DataProvider
 * @author Max Melzer <max.melzer@netresearch.de>
 */
class RecipientStreet extends AbstractDataProvider
{
    /**
     * @var CollectionFactory
     */
    private $collectionFactory;

    /**
     * RecipientStreet constructor.
     *
     * @param CollectionFactory $collectionFactory
     * @param string $name
     * @param string $primaryFieldName
     * @param string $requestFieldName
     * @param array $meta
     * @param array $data
     */
    public function __construct(
        CollectionFactory $collectionFactory,
        $name,
        $primaryFieldName,
        $requestFieldName,
        array $meta = [],
        array $data = []
    ) {
        $this->collectionFactory = $collectionFactory;

        parent::__construct($name, $primaryFieldName, $requestFieldName, $meta, $data);
    }

    /**
     * @return mixed[][]
     * @throws NoSuchEntityException
     */
    public function getData(): array
    {
        $data = parent::getData();

        if (empty($data['items'])) {
            throw new NoSuchEntityException();
        }
        $item = array_pop($data['items']);

        return [$item[$this->getPrimaryFieldName()] => $item];
    }

    /**
     * @return AbstractCollection
     */
    public function getCollection(): AbstractCollection
    {
        if ($this->collection === null) {
            $this->collection = $this->collectionFactory->create();
        }

        return parent::getCollection();
    }
}
