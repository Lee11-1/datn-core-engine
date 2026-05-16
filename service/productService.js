const { getRepository } = require('../config/typeorm');

class ProductService {
  async createProduct(productData) {
    const { sku, name, description, categoryId, price, costPrice, unit, weightG, images, mongoDetailId } = productData;

    if (!sku || !name || !price) {
      throw new Error('Missing required fields: sku, name, price');
    }

    const productRepo = getRepository('Product');
    const existingSKU = await productRepo.findOne({
      where: { sku }
    });

    if (existingSKU) {
      throw new Error('SKU already exists');
    }

    const newProduct = productRepo.create({
      sku,
      name,
      description: description || null,
      categoryId: categoryId || null,
      price: parseFloat(price),
      costPrice: costPrice ? parseFloat(costPrice) : null,
      unit: unit || 'cái',
      weightG: weightG ? parseFloat(weightG) : null,
      images: images || [],
      mongoDetailId: mongoDetailId || null,
      isActive: true,
    });

    return await productRepo.save(newProduct);
  }

  async getProducts(query) {
    const { page = 1, limit = 10, categoryIds, search_text, warehouse_id } = query;
    const productRepo = getRepository('Product');

    let queryBuilder = productRepo.createQueryBuilder('product')
      .where('product.deleted = :deleted', { deleted: false })
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventories', 'inventory')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse')

    if (categoryIds && categoryIds.length > 0) {
      const ids = categoryIds.split(',');
      queryBuilder = queryBuilder.where('product.categoryId IN (:...ids)', { ids });
    }

    if (search_text) {
      queryBuilder = queryBuilder.andWhere(
        '(product.name ILIKE :search_text OR product.sku ILIKE :search_text OR product.description ILIKE :search_text)',
        { search_text: `%${search_text}%` }
      );
    }
    
    if (warehouse_id){
      queryBuilder = queryBuilder.andWhere('inventory.warehouse_id = :warehouse_id', { warehouse_id });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id) {
    const productRepo = getRepository('Product');
    const product = await productRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async updateProduct(id, updateData) {
    const { sku, name, description, categoryId, price, costPrice, unit, weightG, images, mongoDetailId, isActive } = updateData;

    const productRepo = getRepository('Product');
    const product = await productRepo.findOne({
      where: { id }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if SKU is unique (if being updated)
    if (sku && sku !== product.sku) {
      const existingSKU = await productRepo.findOne({
        where: { sku }
      });
      if (existingSKU) {
        throw new Error('SKU already exists');
      }
    }

    // Update fields
    if (sku) product.sku = sku;
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (categoryId !== undefined) product.categoryId = categoryId || null;
    if (price !== undefined) product.price = parseFloat(price);
    if (costPrice !== undefined) product.costPrice = costPrice ? parseFloat(costPrice) : null;
    if (unit) product.unit = unit;
    if (weightG !== undefined) product.weightG = weightG ? parseFloat(weightG) : null;
    if (images !== undefined) product.images = images;
    if (mongoDetailId !== undefined) product.mongoDetailId = mongoDetailId;
    if (isActive !== undefined) product.isActive = isActive;

    return await productRepo.save(product);
  }

  async deleteProduct(id) {
    const productRepo = getRepository('Product');
    const product = await productRepo.findOne({
      where: { id }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    product.deleted = true
    const inventoryRepo = await getRepository('Inventory')
    await inventoryRepo.delete({ productId: id });

    return await productRepo.save(product);
  }

  async getProductsBySKU(skus) {
    const productRepo = getRepository('Product');
    return await productRepo.find({
      where: skus.map(sku => ({ sku })),
      relations: ['category'],
    });
  }


  async searchProducts(keyword, limit = 20) {
    const productRepo = getRepository('Product');
    return await productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = true')
      .andWhere(
        '(product.name ILIKE :keyword OR product.sku ILIKE :keyword OR product.description ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      )
      .orderBy('product.name', 'ASC')
      .take(limit)
      .getMany();
  }

  async activateProduct(id) {
    const productRepo = getRepository('Product');
    const product = await productRepo.findOne({
      where: { id }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    product.isActive = true;
    return await productRepo.save(product);
  }

  async deactivateProduct(id) {
    const productRepo = getRepository('Product');
    const product = await productRepo.findOne({
      where: { id }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    product.isActive = false;
    return await productRepo.save(product);
  }
}

module.exports = new ProductService();
