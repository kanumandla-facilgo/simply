DROP PROCEDURE IF EXISTS spGetStockBucketDetail;

DELIMITER $$
CREATE  PROCEDURE spGetStockBucketDetail(
                 OUT errorcode		INT, 
                 OUT errormsg		VARCHAR(512),
                     _bucketid      INT
               )
    READS SQL DATA
    DETERMINISTIC

main: BEGIN

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

	SET errorcode  = 0;
 	SET errormsg   = 'Success';

    SELECT d.*,
    u1.name as uom_name,
    u1.short_name as uom_short_name
    FROM  stock_bucket_details d
    INNER JOIN unit_of_measures u1 ON u1.id = d.unit_of_measures_id
    WHERE  d.stock_buckets_id                                                      =  _bucketid
	ORDER BY d.unit_of_measures_id, d.sequence_number;

END$$
DELIMITER ;
