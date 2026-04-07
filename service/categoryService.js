const { getRepository } = require('../config/typeorm');

class CategoryService {
  async createCategory(categoryData) {
    const { name, slug, parentId, sortOrder } = categoryData;

    if (!name || !slug) {
      throw new Error('Missing required fields: name, slug');
    }

    const categoryRepo = getRepository('Category');
    const existingSlug = await categoryRepo.findOne({
      where: { slug }
    });

    if (existingSlug) {
      throw new Error('Slug already exists');
    }

    if (parentId) {
      const parentCategory = await categoryRepo.findOne({
        where: { id: parentId }
      });
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
    }

    const newCategory = categoryRepo.create({
      name,
      slug,
      parentId: parentId || null,
      sortOrder: sortOrder || 0,
      isActive: true,
    });

    return await categoryRepo.save(newCategory);
  }

  async getCategories(query) {
    const { page = 1, limit = 10, isActive = 'true', search, parentId } = query;
    const categoryRepo = getRepository('Category');

    let queryBuilder = categoryRepo.createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children');

    if (isActive !== 'all') {
      queryBuilder = queryBuilder.where('category.isActive = :isActive', {
        isActive: isActive === 'true' ? true : false
      });
    }

    if (parentId) {
      queryBuilder = queryBuilder.andWhere('category.parentId = :parentId', { parentId });
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(category.name ILIKE :search OR category.slug ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [categories, total] = await queryBuilder
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCategoryById(id) {
    const categoryRepo = getRepository('Category');
    const category = await categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async updateCategory(id, updateData) {
    const { name, slug, parentId, sortOrder, isActive } = updateData;

    const categoryRepo = getRepository('Category');
    const category = await categoryRepo.findOne({
      where: { id }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (slug && slug !== category.slug) {
      const existingSlug = await categoryRepo.findOne({
        where: { slug }
      });
      if (existingSlug) {
        throw new Error('Slug already exists');
      }
    }
    if (parentId && parentId !== category.id) {
      const parentCategory = await categoryRepo.findOne({
        where: { id: parentId }
      });
      if (!parentCategory) {
        throw new Error('Parent category not found');
      }
      if (parentId === id) {
        throw new Error('Cannot set category as its own parent');
      }
    }

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (parentId !== undefined) category.parentId = parentId || null;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    return await categoryRepo.save(category);
  }

  async deleteCategory(id) {
    const categoryRepo = getRepository('Category');
    const category = await categoryRepo.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new Error('Cannot delete category with child categories');
    }

    return await categoryRepo.remove(category);
  }

  async getCategoryTree() {
    const categoryRepo = getRepository('Category');
    const categories = await categoryRepo.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });

    // Build tree structure
    const map = {};
    const tree = [];

    // First pass: create map
    categories.forEach(category => {
      map[category.id] = { ...category, children: [] };
    });

    // Second pass: build tree
    categories.forEach(category => {
      if (category.parentId && map[category.parentId]) {
        map[category.parentId].children.push(map[category.id]);
      } else {
        tree.push(map[category.id]);
      }
    });

    return tree;
  }

  async getRootCategories() {
    const categoryRepo = getRepository('Category');
    const categories = await categoryRepo.find({
      where: {
        parentId: null,
        isActive: true,
      },
      relations: ['children'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });

    return categories;
  }

  async getChildCategories(parentId) {
    const categoryRepo = getRepository('Category');
    const categories = await categoryRepo.find({
      where: {
        parentId,
        isActive: true,
      },
      relations: ['parent'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });

    return categories;
  }

  async activateCategory(id) {
    const categoryRepo = getRepository('Category');
    const category = await categoryRepo.findOne({
      where: { id }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    category.isActive = true;
    return await categoryRepo.save(category);
  }

  async deactivateCategory(id) {
    const categoryRepo = getRepository('Category');
    const category = await categoryRepo.findOne({
      where: { id }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    category.isActive = false;
    return await categoryRepo.save(category);
  }

  async reorderCategories(id, newSortOrder) {
    const categoryRepo = getRepository('Category');
    const category = await categoryRepo.findOne({
      where: { id }
    });

    if (!category) {
      throw new Error('Category not found');
    }

    category.sortOrder = newSortOrder;
    return await categoryRepo.save(category);
  }
}

module.exports = new CategoryService();
