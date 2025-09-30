import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Table,
  Image,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

type ProductStatus = "active" | "inactive";

interface ProductRow {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  image: string;
  status: ProductStatus;
}

interface Category {
  id: string;
  name: string;
}

export default function Products() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  // Fetch products and categories
  useEffect(() => {
    axios.get("http://localhost:3001/products").then((res) => {
      setRows(res.data);
    });
    axios.get("http://localhost:3001/categories").then((res) => {
      setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    if (!open) setImageUrl("");
  }, [open]);

  const filtered = useMemo(() => {
    return rows
      .filter((r) =>
        search ? (r.name + r.code).toLowerCase().includes(search.toLowerCase()) : true
      )
      .filter((r) => (statusFilter ? r.status === statusFilter : true));
  }, [rows, search, statusFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const columns = [
    { title: "Mã", dataIndex: "code", key: "code", width: 120 },
    { title: "Tên", dataIndex: "name", key: "name" },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 160,
      render: (id: string) => categories.find((c) => c.id === id)?.name || "-",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 140,
      render: (v: number) => v.toLocaleString() + " đ",
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 120,
      render: (src: string) =>
        src ? <Image src={src} width={56} /> : <span>-</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: ProductStatus) =>
        s === "active" ? "Hoạt động" : "Ngừng hoạt động",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
      render: (_: unknown, record: ProductRow) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Button size="small" danger onClick={() => onDelete(record.id)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const onAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const onEdit = (row: ProductRow) => {
    setEditing(row);
    setImageUrl(row.image || "");
    setOpen(true);
  };

  const onDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa sản phẩm này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => {
        axios.delete(`http://localhost:3001/products/${id}`).then(() => {
          setRows((prev) => prev.filter((r) => r.id !== id));
        });
      },
    });
  };

  const onSubmit = (values: Omit<ProductRow, "id" | "image">) => {
    const next: ProductRow = {
      id: editing?.id ?? uuidv4(),
      ...values,
      image: imageUrl,
      price: Number(values.price),
    };

    if (editing) {
      axios
        .put(`http://localhost:3001/products/${editing.id}`, next)
        .then(() => {
          setRows((prev) =>
            prev.map((r) => (r.id === editing.id ? next : r))
          );
          setOpen(false);
        });
    } else {
      axios.post("http://localhost:3001/products", next).then(() => {
        setRows((prev) => [...prev, next]);
        setOpen(false);
      });
    }
  };

  const handleUploadToCloudinary = async (file: File) => {
    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await axios.post(url, formData);
      setImageUrl(res.data.secure_url);
    } catch (err) {
      console.error("Upload failed:", err);
    }

    return false;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold">Quản lý sản phẩm</div>
        <Button type="primary" onClick={onAdd}>
          Thêm mới
        </Button>
      </div>

      <div className="flex justify-end gap-3">
        <Select
          placeholder="Trạng thái"
          className="min-w-40"
          allowClear
          value={statusFilter || undefined}
          onChange={(v) => setStatusFilter((v as ProductStatus) || "")}
          options={[
            { value: "active", label: "Hoạt động" },
            { value: "inactive", label: "Ngừng hoạt động" },
          ]}
        />
        <Input
          style={{ width: "300px" }}
          placeholder="Tìm kiếm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={paged}
        pagination={false}
        rowKey="id"
      />

      <div className="flex justify-end">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={filtered.length}
          onChange={setPage}
        />
      </div>

      <Modal
        title={editing ? "Sửa sản phẩm" : "Thêm mới sản phẩm"}
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={onSubmit}
          initialValues={editing ?? { status: "active" }}
          key={editing?.id ?? "new"}
        >
          <Form.Item
            name="code"
            label="Mã"
            rules={[{ required: true, message: "Nhập mã sản phẩm" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: "Chọn danh mục" }]}
          >
            <Select
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              placeholder="Chọn danh mục"
            />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: "Nhập giá sản phẩm" }]}
          >
            <Input type="number" min={0} />
               </Form.Item>
          <Form.Item label="Ảnh sản phẩm">
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={handleUploadToCloudinary}
            >
              <div>
                <UploadOutlined />
                <div>Chọn ảnh</div>
              </div>
            </Upload>
            {imageUrl && <Image src={imageUrl} width={100} />}
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "active", label: "Hoạt động" },
                { value: "inactive", label: "Ngừng hoạt động" },
              ]}
            />
          </Form.Item>
          <Form.Item noStyle>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
