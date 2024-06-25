ALTER TABLE actor                       RENAME COLUMN actor_id TO id;
ALTER TABLE actor                       RENAME COLUMN first_name TO given_name;
ALTER TABLE actor                       RENAME COLUMN last_name TO surname;
ALTER TABLE actor                       RENAME COLUMN last_update TO updated;
ALTER TABLE actor_info                  RENAME COLUMN actor_id TO id;
ALTER TABLE actor_info                  RENAME COLUMN first_name TO given_name;
ALTER TABLE actor_info                  RENAME COLUMN last_name TO surname;
ALTER TABLE address                     RENAME COLUMN address_id TO id;
ALTER TABLE address                     RENAME COLUMN address TO addr1;
ALTER TABLE address                     RENAME COLUMN address2 TO addr2;
ALTER TABLE address                     RENAME COLUMN district TO state_distr;
ALTER TABLE address                     RENAME COLUMN postal_code TO zip;
ALTER TABLE address                     RENAME COLUMN phone TO phone_num;
ALTER TABLE address                     RENAME COLUMN last_update TO updated;
ALTER TABLE category                    RENAME COLUMN category_id TO id;
ALTER TABLE category                    RENAME COLUMN last_update TO updated;
ALTER TABLE city                        RENAME COLUMN city_id TO id;
ALTER TABLE city                        RENAME COLUMN last_update TO updated;
ALTER TABLE country                     RENAME COLUMN country_id TO id;
ALTER TABLE country                     RENAME COLUMN last_update TO updated;
ALTER TABLE customer                    RENAME COLUMN customer_id TO id;
ALTER TABLE customer                    RENAME COLUMN first_name TO given_name;
ALTER TABLE customer                    RENAME COLUMN last_name TO surname;
ALTER TABLE customer                    RENAME COLUMN email TO email_addr;
ALTER TABLE customer                    DROP COLUMN active;
ALTER TABLE customer                    RENAME COLUMN activebool TO active;
ALTER TABLE customer                    RENAME COLUMN last_update TO updated;
ALTER TABLE film                        RENAME COLUMN film_id TO id;
ALTER TABLE film                        RENAME COLUMN description TO logline;
ALTER TABLE film                        RENAME COLUMN original_language_id TO language_orig;
ALTER TABLE film                        RENAME COLUMN rental_duration TO due_back_duration;
ALTER TABLE film                        RENAME COLUMN rental_rate TO rate;
ALTER TABLE film                        RENAME COLUMN replacement_cost TO replacement;
ALTER TABLE film                        RENAME COLUMN rating TO rated;
ALTER TABLE film                        RENAME COLUMN last_update TO updated;
ALTER TABLE film_actor                  RENAME COLUMN actor_id TO id;
ALTER TABLE film_actor                  RENAME COLUMN last_update TO updated;
ALTER TABLE film_category               RENAME COLUMN last_update TO updated;
ALTER TABLE film_list                   RENAME COLUMN description TO logline;
ALTER TABLE inventory                   RENAME COLUMN last_update TO updated;
ALTER TABLE language                    RENAME COLUMN name TO lang;
ALTER TABLE language                    RENAME COLUMN last_update TO updated;
ALTER TABLE nicer_but_slower_film_list  RENAME COLUMN description TO logline;
ALTER TABLE payment                     RENAME COLUMN payment_id TO id;
ALTER TABLE payment                     RENAME COLUMN staff_id TO handled_by;
ALTER TABLE rental                      RENAME COLUMN rental_id TO id;
ALTER TABLE rental                      RENAME COLUMN last_update TO updated;
ALTER TABLE staff                       RENAME COLUMN staff_id TO id;
ALTER TABLE staff                       RENAME COLUMN password TO pass_md5_no_salt;
ALTER TABLE staff                       RENAME COLUMN last_update TO updated;
ALTER TABLE store                       RENAME COLUMN store_id TO id;
ALTER TABLE store                       RENAME COLUMN manager_staff_id TO manager;
ALTER TABLE store                       RENAME COLUMN last_update TO updated;




ALTER TABLE actor RENAME TO castmember;
ALTER TABLE actor_info RENAME TO cm_info;
ALTER TABLE address RENAME TO loc;
ALTER TABLE category RENAME TO cat;
ALTER TABLE city RENAME TO muni;
ALTER TABLE customer RENAME TO patron;
ALTER TABLE customer_list RENAME TO patron_list;
ALTER TABLE film RENAME TO movie;
ALTER TABLE film_actor RENAME TO movie_cm;
ALTER TABLE film_category RENAME TO movie_cat;
ALTER TABLE film_list RENAME TO movie_list;
ALTER TABLE inventory RENAME TO catalog;
ALTER TABLE language RENAME TO lang;
ALTER TABLE payment RENAME TO paymant;
ALTER TABLE rental RENAME TO trans;
ALTER TABLE sales_by_film_category RENAME TO sales_by_cat;
ALTER TABLE staff RENAME TO team;
ALTER TABLE staff_list RENAME TO team_list;
ALTER TABLE store RENAME TO franchise_unit;

-- modernize this part of the schema, the only use of fixed-length strings
-- see discussion: https://hasurahq.slack.com/archives/C05TC2GKL6T/p1713365346318199
ALTER TABLE lang ALTER COLUMN lang TYPE varchar(20) USING trim(trailing from lang);

-------------------------------------------------------------------------------------
-- Add comments to be picked up as documentation by hasura v2. These are copied
-- from the descriptions already added to the v3 metadata. We preface with "N.B.:"
-- just so it's easy to strip other comments from the schema if we want.
-- (TODO will v3 pick these up? if so remove from metadata or just re-track all)

COMMENT ON TABLE cat IS 'film category';
COMMENT ON TABLE muni IS 'city/municipality';
COMMENT ON TABLE paymant IS 'Each payment made by a customer';
COMMENT ON TABLE team IS 'staff members';
-- NOTE: a bit of semantic info on parent-to-us relationship, which we hope will get understood by the LLM 
COMMENT ON TABLE franchise_unit IS 'All store locations. staff and customers may have a home store';
-- NOTE: intentional TODO here
COMMENT ON TABLE loc IS 'address information (TODO: better model name?)';
COMMENT ON TABLE patron IS 'all customers';
--  NOTE: we are precise about capitalization. If this were a postgres enum then 
--  this would be exposed (assuming we support that) in the graphql schema info.
--  With this schema the LLM will need understand and trust our presumed text format
--  from the descr here in order to do a 'where language is french' query
COMMENT ON TABLE lang IS 'language, capitalized like ''French'', ''English'', etc';
COMMENT ON TABLE movie IS 'movies in the catalog, not necessarily in stock';
COMMENT ON TABLE trans IS 'a customer transaction (B.M.S.: these are now only rentals. this table name should probably change)';
COMMENT ON TABLE catalog IS 'inventory of copies';

COMMENT ON COLUMN paymant.handled_by IS '';
--  TODO: we'd like custom scalars to all come documented so we can remove this description
--        maybe we already can? look at SDL, see how this shows up
COMMENT ON COLUMN paymant.payment_date IS 'a postgres ''timestamptz''';
-- NOTE: this description intentionally incorrect (it is incorrect wrt sakila docs)
COMMENT ON COLUMN paymant.rental_id IS 'optional if e.g. for an outstanding fee';
COMMENT ON COLUMN team.pass_md5_no_salt IS 'password, stored with MD5()';
COMMENT ON COLUMN team.picture IS 'jpg';
COMMENT ON COLUMN country.country IS 'country name';
-- NOTE: We'd like LLM to understand this applies to all 'updated' columns
COMMENT ON COLUMN country.updated IS 'When the row was most recently created/updated';
-- NOTE: column unintentionally poorly re-named, but we'll leave it
COMMENT ON COLUMN movie_cm.id IS 'actor id';
COMMENT ON COLUMN loc.state_distr IS 'The region of an address; e.g. province, state, prefecture';
COMMENT ON COLUMN patron.active IS 'false is equivalent to deleting a customer';
COMMENT ON COLUMN movie.due_back_duration IS 'length of the rental period (days)';
COMMENT ON COLUMN movie.language_orig IS 'original language of the film, if dubbed';
COMMENT ON COLUMN movie."length" IS '(in minutes)';
COMMENT ON COLUMN movie.logline IS 'log line / blurb';
COMMENT ON COLUMN movie.rate IS 'cost to rent for a rental duration';
-- TODO: remove description entirely, once hasura properly exposes this as a graphql enum 
-- (TODO try this with v2)
COMMENT ON COLUMN movie.rated IS 'possible values are: ''NC-17'', ''R'', ''PG-13'', ''G'', ''PG''';
COMMENT ON COLUMN movie.replacement IS 'charge to cust if lost/damaged';
-- NOTE: another case where we'd prefer this to be a PG enum and that this ended up in the schema:
COMMENT ON COLUMN movie.special_features IS 'Can be: Trailers, Commentaries, Deleted Scenes, Behind the Scenes.';
COMMENT ON COLUMN movie.title IS 'stored all caps';
