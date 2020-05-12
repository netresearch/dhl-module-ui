<?php
/**
 * See LICENSE.md for license details.
 */
declare(strict_types=1);

namespace Dhl\Ui\DataProvider;

use Dhl\ShippingCore\Model\ResourceModel\RecipientStreet\CollectionFactory;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\Model\ResourceModel\Db\Collection\AbstractCollection;
use Magento\Ui\DataProvider\AbstractDataProvider;

class RecipientStreet extends AbstractDataProvider
{
    /**
     * @var RequestInterface
     */
    private $request;

    /**
     * @var CollectionFactory
     */
    private $collectionFactory;

    /**
     * RecipientStreet constructor.
     *
     * @param string $name
     * @param string $primaryFieldName
     * @param string $requestFieldName
     * @param RequestInterface $request
     * @param CollectionFactory $collectionFactory
     * @param mixed[] $meta
     * @param mixed[] $data
     */
    public function __construct(
        $name,
        $primaryFieldName,
        $requestFieldName,
        RequestInterface $request,
        CollectionFactory $collectionFactory,
        array $meta = [],
        array $data = []
    ) {
        $this->request = $request;
        $this->collectionFactory = $collectionFactory;

        parent::__construct($name, $primaryFieldName, $requestFieldName, $meta, $data);
    }

    /**
     * Add order id to recipient street data, can be used for redirect after save.
     *
     * @return mixed[][]
     */
    public function getData(): array
    {
        $data = parent::getData();

        if (!empty($data['items'])) {
            $data['items'][0]['order_id'] = $this->request->getParam('order_id');
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
