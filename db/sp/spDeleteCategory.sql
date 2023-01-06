DROP PROCEDURE IF EXISTS spDeleteCategory;

delimiter //

CREATE PROCEDURE spDeleteCategory
               (
                 OUT errorcode       INT, 
                 OUT errormsg        VARCHAR(512),
                     _companyid      INT,
                     _id             INT
               )
DETERMINISTIC

main: BEGIN

 	DECLARE  l_notfound    INT;
 	DECLARE  l_parentid    INT;
 
 	DECLARE CONTINUE HANDLER FOR SQLSTATE '02000'
      SET l_notfound=1;
/*
	DECLARE EXIT HANDLER FOR SQLEXCEPTION
	BEGIN
		GET DIAGNOSTICS CONDITION 1 @sqlstate = RETURNED_SQLSTATE, @errno = MYSQL_ERRNO, @text = MESSAGE_TEXT;
		SET errormsg  = LEFT(CONCAT(":ERROR: ", " (", @sqlstate, "): ", @text), 512);
		SET errorcode = @errno; 
	END;
*/

    DECLARE EXIT HANDLER FOR sqlexception
     BEGIN
     	SET errorcode  = -300;
     	SET errormsg   = 'Error';
     	ROLLBACK;
     END;

 	SET l_notfound = 0;
 	SET errorcode  = 0;
 	SET errormsg   = 'Success';

	SELECT parent_id
	INTO   l_parentid
	FROM   categories c
	WHERE  c.id           = _id 
	AND    c.companies_id = _companyid
	AND    c.is_root      = 0;

	IF l_notfound = 1 THEN

		SET errorcode  = -200;
		SET errormsg   = 'Category not found!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM categories c WHERE c.parent_id = _id)) THEN

		SET errorcode  = -201;
		SET errormsg   = 'Sub categories found. Cannot delete category!';
		LEAVE main;

	END IF;

	IF (SELECT EXISTS (SELECT 1 FROM product_categories c WHERE c.categories_id = _id)) THEN

		SET errorcode  = -202;
		SET errormsg   = 'Products exist for given category. Cannot delete category!';
		LEAVE main;

	END IF;

	UPDATE categories
	SET    children_count = children_count - 1,
	       last_updated   = NOW()
	WHERE  id             = l_parentid; 

	-- update category leaf flag
	UPDATE categories
	SET    is_leaf        = CASE WHEN children_count = 0 THEN 1 ELSE 0 END,
	       last_updated   = NOW()
	WHERE  id             = l_parentid; 

	-- delete category
	DELETE FROM categories WHERE id = _id;

END;
// 
delimiter ;
