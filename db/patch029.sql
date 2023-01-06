ALTER TABLE `order_details` 
ADD COLUMN `stock_quantity_packed` DECIMAL(10,4) NOT NULL DEFAULT 0 AFTER `stock_quantity`,
ADD COLUMN `stock_alt_quantity_packed` DECIMAL(10,4) NOT NULL DEFAULT 0 AFTER `stock_alt_quantity`;

UPDATE order_details
SET stock_quantity_packed = CASE WHEN stock_unit_of_measures_id = unit_of_measures_id THEN quantity_ordered_packed
                                 WHEN stock_unit_of_measures_id = entered_unit_of_measures_id THEN quantity_entered_packed
                                 ELSE -1
                             END,
 stock_alt_quantity_packed = CASE WHEN stock_alt_unit_of_measures_id = unit_of_measures_id THEN quantity_ordered_packed
                                 WHEN stock_alt_unit_of_measures_id = entered_unit_of_measures_id THEN quantity_entered_packed
                                 ELSE -1
                             END                             
WHERE orders_id IN (SELECT id FROM orders WHERE sysorderstatuses_id IN (4201, 4202));


-- read the data from packing slip
UPDATE order_details
SET stock_quantity_packed = (SELECT IFNULL(SUM(CASE WHEN pd.unit_of_measures_id = order_details.stock_unit_of_measures_id THEN quantity_ordered_packed ELSE quantity_entered_packed END), 0) FROM   packing_slip_details pd, packing_slips s WHERE  s.syspackingslipstatuses_id != 5203 AND pd.packing_slips_id = s.id AND    pd.order_details_id = order_details.id) WHERE stock_quantity_packed = -1;

UPDATE order_details
SET stock_alt_quantity_packed = (SELECT IFNULL(SUM(CASE WHEN pd.unit_of_measures_id = order_details.stock_alt_unit_of_measures_id THEN quantity_ordered_packed ELSE quantity_entered_packed END), 0) FROM   packing_slip_details pd, packing_slips s WHERE  s.syspackingslipstatuses_id != 5203 AND pd.packing_slips_id = s.id AND    pd.order_details_id = order_details.id) WHERE stock_alt_quantity_packed = -1;


ALTER TABLE `products` 
ADD COLUMN `stock_unit_of_measures_id` INT NOT NULL AFTER `unit_price`,
ADD COLUMN `stock_alt_unit_of_measures_id` INT NOT NULL AFTER `stock_unit_of_measures_id`;

UPDATE products AS p
INNER JOIN unit_of_measures AS u ON p.default_qty_uom_id = u.id
SET    p.stock_unit_of_measures_id     = IFNULL(u.end_uom_id, u.id),
       p.stock_alt_unit_of_measures_id = u.id;

ALTER TABLE `orders` 
ADD INDEX `fk_orders_customers_id_created` (`customers_id` ASC, `created` ASC);

ALTER TABLE `packing_slip_details` 
ADD COLUMN `order_unit_of_measures_id` INT NOT NULL AFTER `piece_count`,
ADD INDEX `fk_packing_slip_details_order_unit_of_measures3_idx` (`order_unit_of_measures_id` ASC);


UPDATE packing_slip_details
INNER JOIN order_details ON order_details.id = packing_slip_details.order_details_id
SET packing_slip_details.order_unit_of_measures_id = order_details.entered_unit_of_measures_id;

ALTER TABLE `packing_slip_details` 
ADD CONSTRAINT `fk_packing_slip_details_order_unit_of_measures3`
  FOREIGN KEY (`order_unit_of_measures_id`)
  REFERENCES `unit_of_measures` (`id`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
