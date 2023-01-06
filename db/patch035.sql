update categories 
set children_count = (select count(1) from products p, product_categories c1 where c1.products_id = p.id and c1.categories_id = categories.id and p.statuses_id = 4600)
where id in (select categories_id from product_categories);
