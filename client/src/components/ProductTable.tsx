import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Pagination,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid";

type Product = {
  id: string;
  name: string;
  price: string;
  status: string;
  image: string;
};

// Legacy demo component. Not used anymore after routing pages were added.
const ProductTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  interface ProductColumn {
    title: string;
    dataIndex?: keyof Product | string;
    key: string;
    render?: (text: string, record?: Product) => React.ReactNode;
  }

  const columns: ProductColumn[] = [
    {
      title: "Mã",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (text: string) => (
        <img src={text} alt="product" className="w-20 h-20 object-cover" />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_text: string, record?: Product) => (
        <div className="flex space-x-2">
          <Button type="primary" onClick={() => record && handleEdit(record)}>
            Sửa
          </Button>
          <Button danger onClick={() => record && handleDelete(record.id)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalVisible(true);
  };

  interface HandleEditProps {
    id: string;
    name: string;
    price: string;
    status: string;
    image: string;
  }

  const handleEdit = (product: HandleEditProps): void => {
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  interface ModalFormValues {
    name: string;
    price: string;
    status: string;
    image: { thumbUrl?: string }[];
  }

  const handleModalOk = (values: ModalFormValues): void => {
    const newProduct: Product = {
      ...values,
      id: uuidv4(),
      image: values.image[0]?.thumbUrl || "",
    };
    if (editingProduct) {
      setProducts(
        products.map((product) =>
          product.id === editingProduct.id ? newProduct : product
        )
      );
    } else {
      setProducts([...products, newProduct]);
    }
    setIsModalVisible(false);
  };

  interface SearchEvent {
    target: {
      value: string;
    };
  }

  const handleSearch = (e: SearchEvent): void => {
    setSearchText(e.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Button type="primary" onClick={handleAddNew}>
          Thêm mới sản phẩm
        </Button>
      </div>

      <div className="mb-4 flex justify-end gap-4">
        <Select />
        <Input
          placeholder="Tìm kiếm sản phẩm"
          value={searchText}
          onChange={handleSearch}
          className="w-[300px]"
        />
      </div>

      <Table
        columns={columns}
        dataSource={pagedProducts}
        pagination={false}
        rowKey="id"
      />

      <div className="flex justify-end mt-4">
        <Pagination
          current={1}
          pageSize={10}
          total={100}
          onChange={handlePageChange}
        />
      </div>

      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm mới sản phẩm"}
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form
          initialValues={editingProduct || undefined}
          onFinish={handleModalOk}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập giá sản phẩm!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="image"
            label="Hình ảnh sản phẩm"
            valuePropName="fileList"
            getValueFromEvent={({ fileList }) => fileList}
            extra="Chọn hình ảnh sản phẩm"
          >
            <Upload
              name="image"
              listType="picture-card"
              beforeUpload={() => false}
              className="upload-list-inline"
            >
              <div>
                <UploadOutlined />
                <div>Chọn ảnh</div>
              </div>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductTable;
